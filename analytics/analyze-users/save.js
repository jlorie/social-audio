import ResourceModel from '../commons/resources/resource-model';

const analyticsModel = new ResourceModel(process.env.ANALYTICS_URI);

export default (data) => {
  let output = data.total;
  output.resource = 'user';
  output.created_at = new Date().toISOString();
  output.type = 'total';

  console.info('Persisting analytics for ', output.created_at);
  return analyticsModel.create(output);
};
