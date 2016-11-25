import _ from 'lodash';
import AnalyticsModel from '../analytics/commons/resources/analytics-model';

const analyticsModel = new AnalyticsModel('dev-analytics');
export default (event) => {
  return analyticsModel.get()
    .then(results => {
      let userResults = results.filter(r => {
        let isUserResouce = r.resource === 'user';
        let hasOldFormat = _.has(r, 'ages') && _.has(r, 'confirmed');

        return isUserResouce && hasOldFormat;
      }).map(format);

      console.info(`Found ${userResults.length} items`);
      return userResults;
    })
    .then(items => items.map(update));
};

function update(item) {
  let key = {
    resource: item.resource,
    created_at: item.created_at
  };

  console.info(`Updating item with key: ${JSON.stringify(key, null, 2)}`);
  return analyticsModel.create(item);
}

function format(item) {
  let output = {
    resource: item.resource,
    created_at: item.created_at,
    all: item.all,
    total: {
      ages: item.ages,
      confirmed: item.confirmed,
      countries: item.countries,
      genres: item.genres,
      pending: item.pending,
      registration_type: item.registration_type,
      statuses: item.statuses
    }
  };

  return output;
}
