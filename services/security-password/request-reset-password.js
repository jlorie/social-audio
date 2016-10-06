import fs from 'fs';
import jwt from 'jsonwebtoken';

import config from './config';
import EmailService from '../commons/remote/email-service';
import UserModel from '../commons/resources/user-model';

import { SUCCESS, ERR_USERS } from '../commons/constants';

const URI_USERS = process.env.URI_USERS;
const DIRNAME = (process.env.LAMBDA_TASK_ROOT ? process.env.LAMBDA_TASK_ROOT +
  '/security-password' : __dirname);

const emailService = new EmailService();
const userModel = new UserModel(URI_USERS);

export function requestReset({ email }) {
  console.log('Requesting reset password for user with email ' + email);

  return userModel.getByUsername(email)
    .then(user => {
      if (!user) {
        throw new Error(ERR_USERS.INVALID_EMAIL);
      }

      return sendmail(email)
        .then(() => SUCCESS)
        .catch(err => {
          console.info('An error occurred sending reset password mail to ' + email);
          return {
            status: 'ERROR',
            message: err.message
          };
        });
    });
}

function sendmail(email) {
  console.info('Sending confirmation mail to: ' + email);
  let params = {
    resetLink: config.URL_RESET_PASSWORD + '?email=' + email + '&token=' + getToken(email),
    unsubscribeLink: config.URL_EMAIL_UNSUBSCRIBE + '?email=' + email + '&token=' + getToken(email)
  };

  return getTemplate()
    .then(template => render(template, params))
    .then(body => {
      let params = {
        subject: 'Password reset',
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

    const filePath = DIRNAME + '/html/reset-password.html';
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

  // Se cambia el of por el in debido a que en beta no funciona of y no envia el correo electronico 22-08-2016

  for (let param in params) {
    body = body.replace(`{{${param}}}`, params[param]);
  }
  return body;
}
