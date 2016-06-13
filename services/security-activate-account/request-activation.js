import fs from 'fs';
import jwt from 'jsonwebtoken';

import config from './config';
import EmailService from '../commons/remote/email-service';
import UserModel from '../commons/resources/user-model';

const OK = { status: 'OK' };
const URI_USERS = process.env.URI_USERS;

const emailService = new EmailService();
const userModel = new UserModel(URI_USERS);
const DIRNAME = (process.env.LAMBDA_TASK_ROOT ? process.env.LAMBDA_TASK_ROOT +
  '/activate-account' : __dirname);

export function requestActivation({ email }) {
  console.info('Sending activation mail to ' + email);

  return userModel.getByUsername(email)
    .then(sendmail)
    .then(() => OK)
    .catch(err => {
      console.info('An error occurred sending confirmation mail to ' + email);
      throw err;
    });
}

function sendmail({ username, fullname }) {
  let email = username;
  let params = {
    user_fullname: fullname.split(' ')[0], // first name
    user_email: email,
    confimationLink: config.URL_CONFIRM_EMAIL + '?email=' + email + '&token=' + getToken(email),
    unsubscribeLink: config.URL_EMAIL_UNSUBSCRIBE + '?email=' + email + '&token=' + getToken(email)
  };

  return getTemplate()
    .then(template => render(template, params))
    .then(body => {
      let params = {
        subject: 'Confirm your email address',
        from: `'BBLUUE Team' <${config.EMAIL_SUPPORT}>`,
        to: email,
        body
      };

      return emailService.send(params);
    });
}

function getToken(email) {
  let secret = 'bbluue-' + email;
  let data = { email };

  return jwt.sign(data, secret, {
    expiresIn: '1d'
  });
}

function getTemplate() {
  let result = (resolve, reject) => {
    let options = {
      encoding: 'utf-8'
    };

    const filePath = DIRNAME + '/html/account-confirmation.html';
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
