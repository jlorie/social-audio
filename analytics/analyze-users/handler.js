import analyzeUsers from './analyze-users';
import analyzeDevices from './analyze-devices';
import save from './save';

export default (event, context) => {
  let analyzeTasks = [
    analyzeUsers(),
    analyzeDevices()
  ];

  // Runing analyzers
  return Promise.all(analyzeTasks)
    .then(results => {
      const [userInfo, devInfo] = results;

      let saveTasks = [
        save(userInfo, 'user'),
        save(devInfo, 'device')
      ];

      // Saving info
      return Promise.all(saveTasks);
    })
    .then(result => {
      console.info('==> Success: ', JSON.stringify(result, null, 2));
      context.succeed(result);
    })
    .catch(err => {
      console.info('==> An error occurred. ', err.stack);
      throw err;
    });
};
