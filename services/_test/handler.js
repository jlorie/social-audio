import moment from 'moment';

export default () => {
  return Promise.resolve(calculateOffset(9));
};


function calculateOffset(desiredHour) {
  const currentHour = moment.utc().hour();

  let result;
  for (let offset = -11; offset <= 12; offset++) {
    if (desiredHour === (currentHour + offset) % 24) {
      result = offset;
      break;
    }
  }

  return result;
}
