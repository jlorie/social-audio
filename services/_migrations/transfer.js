import ResourceModel from '../commons/resources/resource-model';

const INFINITE = 10000000000000000;

export function transfer(sourceTable, destTable) {
  console.info(`Transfering data from ${sourceTable} to ${destTable}`);
  return getData(sourceTable)
    .then(results => insertData(destTable, results))
    .then(() => 'OK');
}

function getData(sourceTable) {
  console.info('Getting data from ' + sourceTable);

  const sourceModel = new ResourceModel(sourceTable);
  return sourceModel.get({ query: {}, limit: INFINITE });
}

function insertData(destTable, data) {
  console.info(`Inserting ${data.length} rows to ${destTable}`);

  const destModel = new ResourceModel(destTable);
  return destModel.batchCreate(data);
}
