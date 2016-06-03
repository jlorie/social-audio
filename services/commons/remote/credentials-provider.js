import AWS from 'aws-sdk';

class CredentialProvider {
  constructor({ identityPoolId, identityRoleArn, region = 'us-east-1' }) {
    this.identityPoolId = identityPoolId;
    this.identityRoleArn = identityRoleArn;

    // set the Amazon Cognito region
    AWS.config.region = region;
  }

  getUserIdentity() {
    let result = (resolve, reject) => {
      // initialize the Credentials object with our parameters
      AWS.config.credentials = new AWS.CognitoIdentityCredentials({
        IdentityPoolId: this.identityPoolId,
      });

      // We can set the get method of the Credentials object to retrieve
      // the unique identifier for the end user (identityId) once the provider
      // has refreshed itself
      AWS.config.credentials.get(err => {
        if (err) {
          return reject(err);
        }

        resolve(AWS.config.credentials.identityId);
      });
    };

    return new Promise(result);
  }

  getUserCredentials({ identityId, username }) {
    let result = (resolve, reject) => {
      let params = {
        IdentityId: identityId
      };

      // Get the Role associated with the id coming from the pool
      const cognitoIdentity = new AWS.CognitoIdentity();

      cognitoIdentity.getOpenIdToken(params, (err, dataToken) => {
        if (err) {
          return reject(err);
        }
        // Get temporarly credientials form STS to access the API
        let credentialParams = {
          RoleArn: this.identityRoleArn,
          RoleSessionName: username,
          WebIdentityToken: dataToken.Token,
          DurationSeconds: (60 * 60) // 1 hour
        };

        const sts = new AWS.STS();
        sts.assumeRoleWithWebIdentity(credentialParams, (error, data) => {
          if (error) {
            return reject(error);
          }

          let credentials = {
            accessKey: data.Credentials.AccessKeyId,
            secretKey: data.Credentials.SecretAccessKey,
            sessionToken: data.Credentials.SessionToken,
            expiration: data.Credentials.Expiration,
            region: AWS.config.region
          };

          resolve(credentials);
        });
      });
    };

    return new Promise(result);
  }
}

export default CredentialProvider;
