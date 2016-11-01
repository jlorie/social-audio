import moment from 'moment';
import ResourceModel from '../commons/resources/resource-model';

const userAnalytics = new ResourceModel(process.env.USER_ANALYTICS_URI);

export default (data) => {
  let dateTime = moment();

  const output = data.total;
  output.date = dateTime.format('YYYY-MM-DD');
  output.timestamp = dateTime.format('hh:mm:ss');
  output.type = 'total';

  console.info('Persisting analytics for ', dateTime.format());
  return userAnalytics.create(output);
};
