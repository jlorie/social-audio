import fs from 'fs';

import EmailService from '../commons/remote/email-service';
import { EMAIL_STATUS, NOTIFICATION_TYPE } from '../commons/constants';

const EMAIL_SUPPORT = process.env.EMAIL_SUPPORT;
const DIRNAME = (process.env.LAMBDA_TASK_ROOT ? process.env.LAMBDA_TASK_ROOT +
  '/users-notify' : __dirname);

const emailService = new EmailService();

export function email(pendingUsers, type, elementId, emitter) {
  let isEmpty = pendingUsers.length === 0;
  if (isEmpty) {
    return Promise.resolve('OK');
  }

  console.info(`Notifying ${type} via email ${pendingUsers.length} users`);

  // filter by email status
  let users = pendingUsers.filter(user => user.email_status !== EMAIL_STATUS.UNSUSCRIBED);
  let emails = users.map(user => user.username);

  let params = {
    emitterName: emitter.fullname
  };

  return Promise.all(emails.map(email => sendMail(email, params, type)));
}

export function sendMail(email, params, type) {
  console.info('Sending invitation mail to ' + email);

  return getTemplate(type)
    .then(template => render(template, params))
    .then(body => {
      let params = {
        subject: 'BBLUUE Notification',
        from: `'BBLUUE Team' <${EMAIL_SUPPORT}>`,
        to: email,
        body
      };

      return emailService.send(params);
    });
}

function getTemplate(type) {
  let result = (resolve, reject) => {
    let options = {
      encoding: 'utf-8'
    };

    let filePath;
    switch (type) {
      case NOTIFICATION_TYPE.AUDIO_REQUEST:
        {
          filePath = DIRNAME + '/html/audio-request.html';
          break;
        }
      case NOTIFICATION_TYPE.NEW_AUDIO:
        {
          filePath = DIRNAME + '/html/new-audio.html';
          break;
        }
      default:
        {
          throw new Error('InvalidNotificationType');
        }
    }

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
