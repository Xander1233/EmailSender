export interface Configuration {
	server: {
		port: number;
		allowedTypes: string[];
		allowedOrigins: string[];
	}
	email: {
		username: string;
		password: string;
		host: string;
		port: number;
		from: string;
		interval: string;
	}
}