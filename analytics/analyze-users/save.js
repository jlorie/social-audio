import ResourceModel from '../commons/resources/resource-model';

const analyticsModel = new ResourceModel(process.env.ANALYTICS_URI);

export default (data, resource) => {
  let output = data;
  output.resource = resource;
  output.created_at = new Date().toISOString();

  console.info(`Persisting ${resource} analytics at ${output.created_at}`);
  return analyticsModel.create(output);
};
