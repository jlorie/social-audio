import UserModel from '../commons/resources/user-model';

const URI_USERS = process.env.URI_USERS;
const NOTIFICATION_TYPE = {
  AUDIO_REQUEST: 'audio_request',
  NEW_AUDIO: 'new_audio'
};

const userModel = new UserModel(URI_USERS);

export function resolveMessage({ emitterId, type }) {
  console.info('Resolving notification message ' + type + ' for user ' + emitterId);

  return userModel.getById(emitterId)
    .then(emitter => {
      let result;
      switch (type) {
        case NOTIFICATION_TYPE.AUDIO_REQUEST:
          {
            result = `${emitter.fullname} is asking you to add an audiography`;
            break;
          }
        case NOTIFICATION_TYPE.NEW_AUDIO:
          {
            result = `${emitter.fullname} added a new audiography`;
            break;
          }
        default:
          {
            throw new Error('InvalidType');
          }
      }

      return Promise.resolve(result);
    });
}
