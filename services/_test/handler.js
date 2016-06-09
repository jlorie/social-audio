import GeneralConfig from '../commons/resources/general-config';

const config = new GeneralConfig();
export default (event, context) => {
  return config.get('basic_account_space')
    .then(spaces => spaces['basic']);
};
