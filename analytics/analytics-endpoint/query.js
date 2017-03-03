import AnalyticsModel from '../commons/resources/analytics-model';

const analyticsModel = new AnalyticsModel(process.env.ANALYTICS_URI);

export function queryUsers(from, to) {
  console.info(`Querying user analytics from ${from} to ${to}`);
  return analyticsModel.findByDate('user', from, to);
}

export function queryDevices(from, to) {
  console.info(`Querying device analytics from ${from} to ${to}`);
  return analyticsModel.findByDate('device', from, to);
}
