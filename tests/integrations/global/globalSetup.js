import database from '../utils/db';

module.exports = async () => {
  const { server, shutdown } = require('~/apis');
  const mongodb = database();
  const db = await mongodb.connect();

  global.server = server;
  global.db = db;
  global.mongodb = mongodb;
  global.shutdown = shutdown;
};
