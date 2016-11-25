import moment from 'moment';
import ResourceModel from '../commons/resources/resource-model';
import ReferenceModel from '../commons/resources/reference-model';

const URI_USERS = process.env.URI_USERS;
const SERVERLESS_REGION = process.env.SERVERLESS_REGION;

const userModel = new ResourceModel(URI_USERS, SERVERLESS_REGION);

export default () => {
  let all = 0;
  let total = {
    confirmed: 0,
    pending: 0,
    statuses: {
      active: 0,
      pasive: 0,
      inactive: 0
    },
    registration_type: {
      organic: 0,
      invited: 0
    },
    countries: {
      unknown: 0
    },
    genres: {
      male: 0,
      female: 0
    },
    ages: {}
  };

  console.info('Getting users ...');
  return userModel.get()
    .then(users => {
      all = users.length;

      let confirmedUsers = [];
      for (let user of users) {
        // statuses
        if (user.user_status === 'pending') {
          total.pending++;
          continue;
        }

        confirmedUsers.push(user);
        // countries
        if (user.country) {
          total.countries[user.country] = (total.countries[user.country] || 0) + 1;
        } else {
          total.countries.unknown++;
        }

        // genres
        if (user.genre === 'M') {
          total.genres.male++;
        } else {
          total.genres.female++;
        }

        // ages
        let age = moment.duration(moment.now() - moment(user.birthdate)).years();
        total.ages[age] = (total.ages[age] || 0) + 1;
      }

      total.confirmed = confirmedUsers.length;

      let tasks = [
        resolveInvitedUsers(confirmedUsers.map(u => u.username)),
        resolveActiveUsers()
      ];

      return Promise.all(tasks)
        .then(results => {
          let [invitedCount, activeUsers] = results;

          // setting up registration type count
          total.registration_type = {
            organic: total.confirmed - invitedCount,
            invited: invitedCount
          };

          // setting up users status
          total.statuses = {
            active: activeUsers.length,
            pasive: total.confirmed - activeUsers.length,
            inactive: '-'
          };

          let output = { all, total };
          return Promise.resolve(output);
        });
    });
};


function resolveInvitedUsers(emails) {
  console.info('Calculating invited users...');

  const invitationModel = new ResourceModel(process.env.INVITATIONS_URI);
  return invitationModel.batchGet(emails.map(email => ({ email })))
    .then(results => results.length);
}

function resolveActiveUsers() {
  const referenceModel = new ReferenceModel(process.env.REFERENCES_URI);
  return referenceModel.findByDay(moment().format('YYYY-MM-DD'))
    .then(references => {
      let activeUsers = new Set();

      for (let ref of references) {
        activeUsers.add(ref.user_id);
      }

      return Array.from(activeUsers);
    });
}

function resolvePassiveUsers(activeUsers) {
  const deviceModel = new ResourceModel(process.env.URI_DEVICES);
  // return deviceModel.get(moment().format('YYYY-MM-DD'))
  //   .then(references => {
  //     let activeUsers = new Set();
  //
  //     for (let ref of references) {
  //       activeUsers.add(ref.user_id);
  //     }
  //
  //     return Array.from(activeUsers);
  //   });
}
