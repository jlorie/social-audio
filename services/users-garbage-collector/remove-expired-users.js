import UserModel from '../commons/resources/user-model';
import EmailService from '../commons/remote/email-service';
import { render } from '../commons/helpers/mail-helper';

const EMAIL_SUPPORT = process.env.EMAIL_SUPPORT;
const URI_USERS = process.env.URI_USERS;
const DIRNAME = (process.env.LAMBDA_TASK_ROOT ? process.env.LAMBDA_TASK_ROOT +
  '/users-garbage-collector' : __dirname);


const userModel = new UserModel(URI_USERS);
const emailService = new EmailService();

const MONTH_DAYS = 6;

export function removeExpiredUsers() {
  return userModel.expiredUsers(MONTH_DAYS)
    .then(users => {
      console.info('Removing ' + users.length + ' expired users');
      return Promise.all(users.map(deleteUser));
    })
    .catch(err => {
      console.info('An error occurred removing expired users. ' + err);
      throw err;
    });
}

function deleteUser(user) {
  console.info('Removing user ' + user.id);

  return userModel.remove(user.username)
    .then(() => sendmail(user.username));
}

function sendmail(email) {
  console.info('Sending removal mail to ' + email);

  let templatePath = DIRNAME + '/html/account-expired.html';
  return render(templatePath)
    .then(body => {
      let params = {
        subject: 'Account deleted',
        from: `'BBLUUE Team' <${EMAIL_SUPPORT}>`,
        to: email,
        body
      };

      return emailService.send(params);
    });
}
