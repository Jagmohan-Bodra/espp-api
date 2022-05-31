var MongoClient = require('mongodb').MongoClient;

import { MONGODB__CONNECTION_STRING, MONGODB__NAME } from './config';
let dbConnect;

export default () => ({
  connect() {
    return new Promise((resolve, reject) => {
      const callback = (err, db) => {
        if (err) return reject(err);

        const dbo = db.db(MONGODB__NAME);
        dbConnect = db;
        console.log('Connected to test MongoDB...');
        return resolve(dbo);
      };

      MongoClient.connect(MONGODB__CONNECTION_STRING, callback);
    });
  },
  close() {
    dbConnect.close(() => console.log('MongoDb connection closed.'));
  },
});
