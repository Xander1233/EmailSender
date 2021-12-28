import { Configuration } from "./config/Parser";
import { Queue } from "./lib/Queue/Queue";
import { Email } from "./struct/Email";
import nodecron from 'node-cron';
import nodemailer from 'nodemailer';
import Handlebars from "handlebars";
import fetch from 'node-fetch';
import Logger from "@ayanaware/logger";
import { EmailStatus } from "./struct/enum/EmailStatus";

const logger = Logger.get()

export class EmailClient {

	/**
	 * The queue that is used to store the emails and send them in the correct order
	 * @type {Queue<Email>}
	 */
	private emailQueue: Queue<Email>;

	/**
	 * The nodemail transport client
	 * @type {nodemailer.Transporter}
	 */
	private client: nodemailer.Transporter;

	/**
	 * The configuration object
	 * @type {Configuration}
	 */
	private config = Configuration;

	/**
	 * The cron job that is used to watch over the queue
	 * @type {nodecron.ScheduledTask}
	 */
	private cronJob: nodecron.ScheduledTask;

	/**
	 * Specfies the state of the queue
	 * @type {boolean}
	 */
	private queueWorking: boolean = false;

	/**
	 * The last sent email status
	 * @type {EmailStatus}
	 */
	private lastEmailStatus: EmailStatus = EmailStatus.NONE;

	/**
	 * Constructor for the EmailClient
	 * Initializes the queue and the nodemailer client
	 */
	constructor() {
		this.emailQueue = new Queue<Email>();

		this.client = nodemailer.createTransport({
			host: this.config.email.host,
			port: this.config.email.port,
			auth: {
				user: this.config.email.username,
				pass: this.config.email.password
			}
		});
	}

	/**
	 * Add a new email to the end of the queue
	 * @param {Email} email The email that should be added to the end of the queue
	 */
	public addEmail(email: Email) {
		this.emailQueue.push(email);

		void this.init();
	}

	/**
	 * Start the watching of the queue
	 */
	public async startQueue() {
		// Manages "queue watching" every specified interval
		this.cronJob = nodecron.schedule(this.config.email.interval, this.init.bind(this));
	}

	/**
	 * The function that is called every specified interval.
	 * Checks if the queue is empty and if it is not, loop through the queue and send each email after another
	 * If the client is already working on the queue, the function will return
	 * @returns {Promise<void>}
	 */
	private async init() {

		// Return if queue is already working
		if (this.queueWorking) {
			return;
		}

		// Set queue working state to true
		this.queueWorking = true;

		// Loop through queue
		while (this.emailQueue.length > 0) {

			// Get first email from queue
			const email = this.emailQueue.pop();

			if (email) {
				// Send email if email is not undefined
				await this.sendEmail(email);
			}
		}

		// Set queue working state to false
		this.queueWorking = false;
	}

	/**
	 * Send the provided email object
	 * Fetches the email template from the url specified in the email object. If there is no url specified, the content of the email object is used as the template
	 * If the template is fetched successfully and either a HTML or handlebars template is found, the email is compiled using handlebars
	 * After the successful compiling of the template, the email is sent
	 * @param {Email} email The email that should be sent
	 */
	private async sendEmail(email: Email) {
		try {
			// If the template content is undefined, fetch the template from the URL
			// Otherwise use the template content value
			let template: any = email.Template;
			if (!template) {
				template = await (await fetch(email.TemplateURL)).text();
			}
	
			// Compile the template
			let templateCompiled = template;
	
			const options: any = {
				from: this.config.email.username,
				to: Array.isArray(email.To) ? email.To.join(',') : email.To,
				subject: email.Subject
			}

			// If the template is a HTML/handlebar template, compile it with Handlebars and the specified payload
			if (
				// Check if the template is a HTML template
				(templateCompiled.startsWith('<!DOCTYPE html>') || templateCompiled.startsWith('<html')) &&
				// Check if HTML/Handlebars are allowed
				(this.config.server.allowedTypes.includes('html') || (this.config.server.allowedTypes.includes('handlebars') && templateCompiled.includes('{{')))
			)
				options.html = Handlebars.compile(template)(this.config.server.allowedTypes.includes("handlebars") ? email.Payload : {});
			else {
				options.text = templateCompiled;
			}

			if (email.CC !== null) {
				options.cc = Array.isArray(email.CC) ? email.CC.join(',') : email.CC;
			}

			if (email.BCC !== null) {
				options.bcc = Array.isArray(email.BCC) ? email.BCC.join(',') : email.BCC;
			}
	
			// Send the email with the compiled template to the specified recipient
			const info = await this.client.sendMail(options);

			// Set the last email status to the status of the current sent email
			this.lastEmailStatus = info.accepted.length > 0 ? EmailStatus.ACCEPTED : info.rejected.length > 0 ? EmailStatus.REJECTED : EmailStatus.PENDING;
		} catch(e) {
			// Catch error and log the stringified email
			logger.warn("Failed to send email | " + email.toString());
		}
	}

	/**
	 * Get the current queue
	 */
	public get Queue(): Queue<Email> {
		return this.emailQueue;
	}

	/**
	 * Get the last email status
	 */
	public get LastEmailStatus(): EmailStatus {
		return this.lastEmailStatus;
	}

	/**
	 * Get the current working on status
	 */
	public get QueueWorking(): boolean {
		return this.queueWorking;
	}

}