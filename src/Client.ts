import Logger from "@ayanaware/logger";
import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { Configuration } from "./config/Parser";
import { EmailClient } from "./EmailClient";
import { Email } from "./struct/Email";

const logger = Logger.get();

export class Client {

	private app: FastifyInstance;

	private config = Configuration;

	private emailClient: EmailClient = new EmailClient();

	constructor(app: FastifyInstance) {
		this.app = app;

		void this.app.post('/email/send', this.sendEmail.bind(this));
		void this.app.get('/email/queue/status', this.queueStatus.bind(this));
		void this.app.get('/email/last/status', this.lastEmailStatus.bind(this));
		void this.app.get('/ping', this.ping.bind(this));
	}

	public async start() {
		try {
			await this.app.listen(this.config.server.port, '0.0.0.0');
			logger.info(`Server listens on *:${this.config.server.port}`);
		} catch(e) {
			logger.error(e);
			logger.error('Server failed to start');
			process.exit(25);
		}
	}

	private async ping(req: FastifyRequest, res: FastifyReply) {
		res.status(200);
		return { status: 'ok' };
	}

	private async sendEmail(req: FastifyRequest, res: FastifyReply) {
		const { subject, to, cc, bcc, payload, template } = req.body as any;

		if (!subject || !to || !payload || !template) {
			res.status(400);
			return { status: 'error', message: 'Missing required fields' };
		}

		let options = { };

		// Check if template is a url or a string with regex
		if (template.match(/^(http|https):\/\/[^ "]+$/)) {
			// Template is a url
			options = { url: template };
		} else
			options = { content: template };

		const email = new Email(subject, to, cc ?? null, bcc ?? null, payload, options);

		this.emailClient.addEmail(email);

		res.status(202);
		return { status: 'Accepted' };
	}

	private async queueStatus(req: FastifyRequest, res: FastifyReply) {
		res.status(200);
		return { length: this.emailClient.Queue.length, workingOn: this.emailClient.QueueWorking };
	}

	private async lastEmailStatus(req: FastifyRequest, res: FastifyReply) {
		res.status(200);
		return { status: this.emailClient.LastEmailStatus };
	}

}