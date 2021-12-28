export class Email {
	
	private subject: string;

	private to: string[] | string;

	private cc: string[] | string | null;

	private bcc: string[] | string | null;

	private payload: any;

	private templateURL: string;

	private template: string;

	constructor(subject: string, to: string | string[], cc: string[] | string | null, bcc: string[] | string | null, payload: any, template: { url?: string, content?: string }) {
		this.subject = subject;
		this.to = to;
		this.cc = cc;
		this.bcc = bcc;
		this.payload = payload;

		if (!template.url && !template.content) {
			throw new Error('Missing template');
		}

		if (template.content) {
			this.template = template.content;
		}

		if (template.url) {
			this.templateURL = template.url;
		}

	}

	public get Subject(): string {
		return this.subject;
	}

	public get Payload(): any {
		return this.payload;
	}

	public get TemplateURL(): string {
		return this.templateURL;
	}

	public get Template(): string {
		return this.template;
	}

	public get To(): string | string[] {
		return this.to;
	}

	public get CC(): string | string[] | null {
		return this.cc;
	}

	public get BCC(): string | string[] | null {
		return this.bcc;
	}

	public toString(): string {
		return `Email{Subject: ${this.subject}, To: ${this.to}, CC: ${this.cc}, BCC: ${this.bcc}, Payload: ${this.payload}, TemplateURL: ${this.templateURL}, Template: ${this.template}}`;
	}
}