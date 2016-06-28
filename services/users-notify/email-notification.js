import Storage from '../commons/remote/storage';
import EmailService from '../commons/remote/email-service';
import ElementModel from '../commons/resources/element-model';

import { EMAIL_STATUS, NOTIFICATION_TYPE } from '../commons/constants';
import { render, genToken } from '../commons/helpers/mail-helper';
import { ERR_ELEMENTS } from '../commons/constants';

const WEEK_IN_SECONDS = 604800;
const URI_ELEMENTS = process.env.URI_ELEMENTS;
const EMAIL_SUPPORT = process.env.EMAIL_SUPPORT;
const URL_EMAIL_UNSUBSCRIBE = process.env.URL_EMAIL_UNSUBSCRIBE;
const DIRNAME = (process.env.LAMBDA_TASK_ROOT ? process.env.LAMBDA_TASK_ROOT +
  '/users-notify' : __dirname);

const emailService = new EmailService();
const elementModel = new ElementModel(URI_ELEMENTS);

export function email(pendingUsers, type, elementId, emitter) {
  let isEmpty = pendingUsers.length === 0;
  if (isEmpty) {
    return Promise.resolve('OK');
  }

  if (type !== NOTIFICATION_TYPE.AUDIO_REQUEST) {
    return Promise.resolve('NothingToDo');
  }

  console.info(`Notifying ${type} via email ${pendingUsers.length} users`);

  return resolveImageUrl(elementId)
    .then(imageUrl => {
      // filter by email status
      let users = pendingUsers.filter(user => user.email_status !== EMAIL_STATUS.UNSUSCRIBED);
      let emails = users.map(user => user.username);

      return Promise.all(emails.map(email => sendMail(emitter.fullname, email, imageUrl)));
    });
}

export function sendMail(emitterName, email, imageUrl) {
  console.info('Sending invitation mail to ' + email);

  let params = {
    emitterName,
    imageUrl,
    unsubscribeLink: URL_EMAIL_UNSUBSCRIBE + '?email=' + email + '&token=' + genToken(email)
  };

  let templatePath = DIRNAME + '/html/audio-request.html';
  return render(templatePath, params)
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

function resolveImageUrl(elementId) {
  return elementModel.getById(elementId)
    .then(element => {
      if (!element) {
        throw new Error(ERR_ELEMENTS.INVALID_ELEMENT);
      }

      return Storage.signUrl(element.source_url, WEEK_IN_SECONDS);
    });
}
