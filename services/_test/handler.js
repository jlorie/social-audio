import migrate from './migrations/migrate';

export default () => {
  return migrate()
    .catch(err => {
      console.info('==> Error: ', err);
    });
};
