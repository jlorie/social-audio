export const EMAIL_STATUS = {
  SUSCRIBED: 'suscribed',
  UNSUSCRIBED: 'unsubscribed'
};

export const NOTIFICATION_TYPE = {
  AUDIO_REQUEST: 'audio_request',
  NEW_AUDIO: 'new_audio',
  PENDING_AUDIO: 'pending_audio',
  ELEMENT_EXPIRED: 'element_expired'
};

export const USER_STATUS = {
  PENDING: 'pending',
  IDLE: 'idle',
  ENABLED: 'enabled',
  DISABLED: 'disabled'
};

export const REF_STATUS = {
  RESOLVED: 'resolved',
  PENDING: 'pending',
  HIDDEN: 'hidden'
};

export const ACCOUNT_TYPE = {
  BASIC: 'basic'
};

export const ERR_USERS = {
  INVALID_USER: 'InvalidUser',
  INVALID_PASS: 'InvalidPassword',
  INVALID_STATUS: 'InvalidStatus'
};

export const ERR_ELEMENTS = {
  INVALID_ELEMENT: 'InvalidElement',
  INVALID_AUDIO: 'InvalidAudio',
  INVALID_ATTACHMENT: 'InvalidAttachment',
  INVALID_TO_SHARE: 'InvalidElementToShare',
  ALREADY_EXISTS: 'ElementArealdyExists',
  INVALID_FORMAT: 'InvalidElementFormat',
  INVALID_ATTACHMENT_FORMAT: 'InvalidAttachmentFormat'
};

export const ERR_NOTIFICATIONS = {
  INVALID_NOTIFICATION: 'InvalidNotificationId',
  INVALID_PARAMETER: 'InvalidParameter',
  ENDPOINT_DISABLED: 'EndpointDisabled'
};

export const ERR_SECURITY = {
  INVALID_OLD_PASSWORD: 'InvalidOldPassword',
  INVALID_USER: 'InvalidUser',
  ACCOUNT_DISABLED: 'AccountDisabled',
  ACCESS_DENIED: 'AccessDenied',
  PERMISSION_DENIED: 'PermisionDenied'
};

export const SUCCESS = {
  status: 'OK'
};

export const EMPTY = {
  message: 'EMPTY',
};


export const ERR_ACTION = {
  UNDEFINED: 'UndefinedAction'
};

export const ERR_AWS = {
  INVALID_PARAMS: 'InvalidParameter'
};

export const NOTHING_TO_DO = 'NothingToDo';
export const PREFIX_SECRET = 'bbluue-';
export const MAX_NOTIFICATIONS = 50;
