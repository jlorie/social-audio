import _ from 'lodash';

function _resolveExpression(data, parent) {
  // calculating prefix for expressions
  let prefix = '';
  if (parent) {
    prefix = `${parent}.`;
  }

  let expressions = [];
  let attrValues = {};
  for (let field in data) {
    if (_.isPlainObject(data[field])) {
      // Getting expressions for inner object
      const innerExpressions = _resolveExpression(data[field], field);
      expressions = _.concat(expressions, innerExpressions.expressions);
      attrValues = _.merge(attrValues, innerExpressions.attrValues);
    } else {
      expressions.push(`${prefix}${field} = :${prefix}${field}`);
      attrValues[`:${prefix}${field}`] = data[field];
    }
  }

  return { expressions, attrValues };
}

export default (event, context) => {
  let data = {
    audios: [{
      id: '6d9b40cdd0d22f49c9093cfe960178c6',
      source_url: 'https://s3.amazonaws.com/dev-bbluue-files/audio/attachment-6d9b40cdd0d22f49c9093cfe960178c6.caf'
    }]
  };

  const { expressions, attrValues } = _resolveExpression(data);
  console.log('==> expression: ', `set ${expressions.join(',')}`);

  return 'End!';
};
