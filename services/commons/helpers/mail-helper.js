import fs from 'fs';
import jwt from 'jsonwebtoken';

export function render(templatePath, params = {}) {
  return getTemplate(templatePath)
    .then(template => {
      let body = template;
      for (let param in params) {
        body = body.replace(`{{${param}}}`, params[param]);
      }

      return body;
    });
}

export function genToken(email, prefixSecret = 'bbluue-') {
  let secret = prefixSecret + email;
  let data = { email };

  return jwt.sign(data, secret, {
    expiresIn: '1d'
  });
}

function getTemplate(templatePath) {
  let result = (resolve, reject) => {
    let options = {
      encoding: 'utf-8'
    };

    fs.readFile(templatePath, options, (err, data) => {
      if (err) {
        return reject(err);
      }

      resolve(data);
    });
  };

  return new Promise(result);
}
