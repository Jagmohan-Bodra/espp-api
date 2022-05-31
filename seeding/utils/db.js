var MongoClient = require('mongodb').MongoClient;

const MONGODB__CONNECTION_STRING="mongodb://user:passwww3@127.0.0.1:27017/dbtest?authSource=admin&readPreference=primary&ssl=false"
const MONGODB__NAME="dbtest"

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
