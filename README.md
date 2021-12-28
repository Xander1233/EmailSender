# EmailSender

Client to send emails using handlebar/text files served via CDNs and URLs dynamically. Each Send-Request is queued to gain structure and maintain order.

## Configuration

- Create a `.env` file at the root of the project
- Add this as the "template" of the `.env` file:
```
SERVER_PORT=
ALLOWED_TYPES=""
ALLOWED_ORIGINS=""

EMAIL_USERNAME=""
EMAIL_PASSWORD=""
EMAIL_HOST=""
EMAIL_PORT=
EMAIL_FROM=""
EMAIL_INTERVAL=""
```
- Change each variable to their respective value (Make sure you use the correct annotations for `ALLOWED_TYPES` and `ALLOWED_ORIGINS`)

### Configuration types

- `SERVER_PORT` {number} is the port that is used for the listening port of the web server, which accepts each Send-Request (Default: 3000) (**Optional**)
- `ALLOWED_TYPES` {string} specifies all allowed types for the template (Accepted: html; handlebars; text) (Make sure you use the correct annotation) (Default: html,handlebars,text) (**Optional**)
- `ALLOWED_ORIGIN` {string} specifies all allowed origins of requests. Can be used to limit Send-Requests for specific servers. Leave this field blank to accept all origins. (Accepted: Any IP-Address) (Make sure you use the correct annotation) (Default: []) (**Optional**)
- `EMAIL_USERNAME` {string} is the username (Most of the time just the email address) of the account that is used to send the emails from (**Required**)
- `EMAIL_PASSWORD` {string} is the password of the account (**Required**)
- `EMAIL_HOST` {string} points to the url of the SMTP server of your email provider (**Required**)
- `EMAIL_PORT` {number} is the port of the SMTP server (Default: 587) (**Optional**)
- `EMAIL_FROM` {string} is used to specify the FROM field of the email (**Required**)
- `EMAIL_INTERVAL` {string} specifies a CRON Job interval. (Check the cron job interval annotation) (Default: `*/10 * * * * *`)

### Configuration Annotation

#### Lists

`ALLOWED_TYPES` and `ALLOWED_ORIGINS` are both lists in the end. So they need to be created in a very specific way.

The only allowed way to give them a correct value is:
- `ALLOWED_TYPES="<value1>,<value2>,<valueX>"`
- `ALLOWED_ORIGINS="<value1>,<value2>,<valueX>"`

E.g.
- `ALLOWED_TYPES="html,text,handlebars"`
- `ALLOWED_ORIGINS="318.321.169.723,127.0.0.1,localhost,48.1.783.937"`

#### Cron job interval

```
 # ┌────────────── second (optional)
 # │ ┌──────────── minute
 # │ │ ┌────────── hour
 # │ │ │ ┌──────── day of month
 # │ │ │ │ ┌────── month
 # │ │ │ │ │ ┌──── day of week
 # │ │ │ │ │ │
 # │ │ │ │ │ │
 # * * * * * *
```

**Allowed values**

|     field    |        value        |
|--------------|---------------------|
|    second    |         0-59        |
|    minute    |         0-59        |
|     hour     |         0-23        |
| day of month |         1-31        |
|     month    |     1-12 (or names) |
|  day of week |     0-7 (or names, 0 or 7 are sunday)  |

**Multiple values**

`1,2,4,5 * * * *` will run every 1th, 2th, 4th, and 5th minute

**Step values**

`*/2 * * * *` will run every 2 minutes

**Names**

*Long names*

`* * * January,September Sunday` will run every sunday in january and september

*Short names*

`* * * Jan,Sep Sun` will run every sunday in january and september

Credits to [node-cron](https://www.npmjs.com/package/node-cron) for the Cron job annotations
