import CredentialProvider from '../commons/remote/credentials-provider';

const provider = new CredentialProvider({
  identityPoolId: 'us-east-1:b24b2f58-2384-4ebe-a390-90b52fb6dda8',
  identityRoleArn: 'arn:aws:iam::141310850160:role/Cognito_bbluuePoolIdentityAuth_Role'
});

export default () => {
  return provider.getUserIdentity();
};
