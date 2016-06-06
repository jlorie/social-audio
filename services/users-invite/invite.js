import fs from 'fs';
import EmailService from '../commons/remote/email-service';
import UserModel from '../commons/resources/user-model';

const URI_USERS = process.env.URI_USERS;
const EMAIL_SUPPORT = process.env.EMAIL_SUPPORT;
const DIRNAME = (process.env.LAMBDA_TASK_ROOT ? process.env.LAMBDA_TASK_ROOT +
  '/security-register' : __dirname);

const emailService = new EmailService();
const userModel = new UserModel(URI_USERS);

export function invite(hostId, emails) {
  return userModel.getById(hostId)
    .then(host => {
      let params = {
        hostname: host.fullname
      };

      return Promise.all(emails.map(email => sendMail(email, params)));
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
