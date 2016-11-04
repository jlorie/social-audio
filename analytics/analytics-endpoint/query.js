import AnalyticsModel from '../commons/resources/analytics-model';

const analyticsModel = new AnalyticsModel(process.env.ANALYTICS_URI);

export default (from, to) => {
  console.info(`Querying user analytics from ${from} to ${to}`);
  return analyticsModel.findByDate('user', from, to);
};
