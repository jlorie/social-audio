import UserModel from '../commons/resources/user-model';
import EmailService from '../commons/remote/email-service';

const EMAIL_SUPPORT = process.env.EMAIL_SUPPORT;
const URI_USERS = process.env.URI_USERS;

const userModel = new UserModel(URI_USERS);
const emailService = new EmailService();

const MONTH_DAYS = 30;

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

  let body = `Hello!
              Your account has been deleted from bbluue app
              30 days have passed without your account activation`;

  return emailService.send({
    subject: 'Account deleted',
    from: `'BBLUUE Team' <${EMAIL_SUPPORT}>`,
    to: email,
    body
  });
}
