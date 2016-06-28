import UserModel from '../commons/resources/user-model';
import EmailService from '../commons/remote/email-service';
import { render, genToken } from '../commons/helpers/mail-helper';

const URI_USERS = process.env.URI_USERS;
const EMAIL_SUPPORT = process.env.EMAIL_SUPPORT;
const URL_CONFIRM_EMAIL = process.env.URL_CONFIRM_EMAIL;
const DIRNAME = (process.env.LAMBDA_TASK_ROOT ? process.env.LAMBDA_TASK_ROOT +
  '/users-garbage-collector' : __dirname);


const WEEK_DAYS = 7;
const STATUS_DISABLED = 'disabled';

const userModel = new UserModel(URI_USERS);
const emailService = new EmailService();

export function disableInactiveUsers() {
  return userModel.inactiveUsers(WEEK_DAYS)
    .then(users => {
      console.info('Disabling ' + users.length + ' inactive users');
      return Promise.all(users.map(disableUser));
    })
    .catch(err => {
      console.info('An error occurred disabling inactive users. ' + err);
      throw err;
    });
}

function disableUser(user) {
  console.info('Disabling user ' + user.id);

  return userModel.update(user.username, { user_status: STATUS_DISABLED })
    .then(() => sendmail(user.username));
}

function sendmail(email) {
  console.info('Sending disabling mail to ' + email);

  // generating confirmation link
  let params = {
    confimationLink: URL_CONFIRM_EMAIL + '?email=' + email + '&token=' + genToken(email),
  };

  let templatePath = DIRNAME + '/html/account-disabled.html';
  return render(templatePath, params)
    .then(body => {
      emailService.send({
        subject: 'Account disabled',
        from: `'BBLUUE Team' <${EMAIL_SUPPORT}>`,
        to: email,
        body
      });
    });
}
