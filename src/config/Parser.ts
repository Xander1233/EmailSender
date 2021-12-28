import { Configuration as Config } from "./ConfigInterface";
import cron from "node-cron";

require('dotenv').config();

const { SERVER_PORT, ALLOWED_TYPES, ALLOWED_ORIGINS, EMAIL_USERNAME, EMAIL_PASSWORD, EMAIL_HOST, EMAIL_PORT, EMAIL_FROM, EMAIL_INTERVAL } = process.env;

const Configuration: Config = {
	server: {
		port: SERVER_PORT ? parseInt(SERVER_PORT) : 3000,
		allowedTypes: ALLOWED_TYPES ? ALLOWED_TYPES.split(',') : [ 'html', 'text', 'handlebars' ],
		allowedOrigins: ALLOWED_ORIGINS ? ALLOWED_ORIGINS.split(',') : []
	},
	email: {
		username: EMAIL_USERNAME,
		password: EMAIL_PASSWORD,
		host: EMAIL_HOST,
		port: EMAIL_PORT ? parseInt(EMAIL_PORT) : 587,
		from: EMAIL_FROM,
		interval: cron.validate(EMAIL_INTERVAL) ? EMAIL_INTERVAL : '*/10 * * * * *'
	}
}

export { Configuration }
