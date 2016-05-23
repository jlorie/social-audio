import AWS from 'aws-sdk';

class EmailService {
  constructor(region = 'us-east-1') {
    // Setting up aws region
    AWS.config.update({ region });
    this.ses = new AWS.SES();
  }

  send({ subject, from, to, body }) {
    let params = {
      Destination: {
        ToAddresses: [to]
      },
      Source: from,
      Message: {
        Subject: {
          Data: subject
        },
        Body: {
          Html: {
            Data: body
          }
        }
      }
    };

    let result = (resolve, reject) => {
      this.ses.sendEmail(params, (err, data) => {
        if (err) {
          reject(err);
        }

        resolve(data);
      });
    };

    return new Promise(result);
  }
}

export default EmailService;
