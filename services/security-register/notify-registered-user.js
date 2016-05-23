import fs from 'fs';
import jwt from 'jsonwebtoken';

import config from './config';
import Notification from '../commons/remote/notification';
import EmailService from '../commons/remote/email-service';

const TOPIC_REGISTERED_USER = process.env.TOPIC_REGISTERED_USER_ARN;
const DIRNAME = (process.env.LAMBDA_TASK_ROOT ? process.env.LAMBDA_TASK_ROOT +
  '/register-user' : __dirname);

const emailService = new EmailService();
const notification = new Notification(TOPIC_REGISTERED_USER);

export function notify(user) {
  let userString = JSON.stringify(user, null, 2);
  console.warn('Notifying user registered: ' + userString);

  return notification.notify(userString)
    .catch(err => {
      console.error('An error occurred notifying ' + TOPIC_REGISTERED_USER + ' topic. ' + err);
      throw err;
    });
}

export function sendWellcomeMail(email) {
  console.warn('Sending welcome mail to ' + email);

  let params = {
    unsubscribeLink: config.URL_EMAIL_UNSUBSCRIBE + '?email=' + email + '&token=' + getToken(email)
  };

  return getTemplate()
    .then(template => render(template, params))
    .then(body => {
      let params = {
        subject: 'Wellcome to BBLUUE!',
        from: `'BBLUUE Team' <${config.EMAIL_SUPPORT}>`,
        to: email,
        body
      };

      return emailService.send(params);
    });
}

function getTemplate() {
  let result = (resolve, reject) => {
    let options = {
      encoding: 'utf-8'
    };

    const filePath = DIRNAME + '/html/welcome.html';
    fs.readFile(filePath, options, (err, data) => {
      if (err) {
        return reject(err);
      }

      resolve(data);
    });
  };

  return new Promise(result);
}

function render(template, params) {
  let body = template;
  for (let param in params) {
    body = body.replace(`{{${param}}}`, params[param]);
  }

  return body;
}

function getToken(email) {
  let secret = 'bbluue-' + email;
  let data = { email };

  return jwt.sign(data, secret, {
    expiresIn: '1d'
  });
}
