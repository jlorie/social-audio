import ReferenceModel from '../analytics/commons/resources/reference-model';

export default (event) => {
  const referenceModel = new ReferenceModel(process.env.REFERENCES_URI);
  return referenceModel.findByDay('2016-11-06');
};
