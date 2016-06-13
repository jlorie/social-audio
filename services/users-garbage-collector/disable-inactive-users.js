import jwt from 'jsonwebtoken';
import UserModel from '../commons/resources/user-model';
import EmailService from '../commons/remote/email-service';

const URI_USERS = process.env.URI_USERS;
const EMAIL_SUPPORT = process.env.EMAIL_SUPPORT;
const URL_CONFIRM_EMAIL = process.env.URL_CONFIRM_EMAIL;

const PREFIX_SECRET = 'bbluue-';
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
  let confimationLink = URL_CONFIRM_EMAIL + '?email=' + email + '&token=' + getToken(email);
  let body = `Hello!
              Your account has been disabled from bbluue app
              a week have passed without your account activation.
              To confirm your email address, go to the following url:
              <a href="${confimationLink}">enlace</a>`;

  return emailService.send({
    subject: 'Account disabled',
    from: `'BBLUUE Team' <${EMAIL_SUPPORT}>`,
    to: email,
    body
  });
}

function getToken(email) {
  let secret = PREFIX_SECRET + email;
  let data = { email };

  return jwt.sign(data, secret, {
    expiresIn: '1d'
  });
}
