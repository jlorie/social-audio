import fs from 'fs';
import jwt from 'jsonwebtoken';

import EmailService from '../commons/remote/email-service';
import UserModel from '../commons/resources/user-model';
import { SUCCESS } from '../commons/constants';

const URI_USERS = process.env.URI_USERS;
const EMAIL_SUPPORT = process.env.EMAIL_SUPPORT;
const URL_EMAIL_UNSUBSCRIBE = process.env.URL_EMAIL_UNSUBSCRIBE;
const DIRNAME = (process.env.LAMBDA_TASK_ROOT ? process.env.LAMBDA_TASK_ROOT +
  '/users-invite' : __dirname);

const emailService = new EmailService();
const userModel = new UserModel(URI_USERS);

export function invite(hostId, emails) {
  return userModel.getById(hostId)
    .then(host => {
      return Promise.all(emails.map(email => {
          let params = {
            hostname: host.fullname,
            unsubscribeLink: URL_EMAIL_UNSUBSCRIBE + '?email=' + email + '&token=' + getToken(email)
          };

          return sendMail(email, params);
        }))
        .then(() => (SUCCESS));
    });
}

export function sendMail(email, params) {
  console.info('Sending invitation mail to ' + email);

  return getTemplate()
    .then(template => render(template, params))
    .then(body => {
      let params = {
        subject: 'Invitation to BBLUUE!',
        from: `'BBLUUE Team' <${EMAIL_SUPPORT}>`,
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

    const filePath = DIRNAME + '/html/invite.html';
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
