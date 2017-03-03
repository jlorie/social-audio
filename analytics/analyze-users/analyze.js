import moment from 'moment';

export default (users) => {
  let total = {
    all: users.length,
    confirmed: 0,
    pending: 0,
    statuses: {
      active: 0,
      pasive: 0,
      inactive: 0
    },
    registration_type: {
      organic: 0,
      invitated: 0
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

  for (let user of users) {
    // statuses
    if (user.user_status === 'pending') {
      total.pending++;
      continue;
    }

    total.confirmed++;
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

  let output = { total };
  return Promise.resolve(output);
};
