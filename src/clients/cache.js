import redis from 'redis';

export default class Cache {
  constructor({ config }) {
    this.client = redis.createClient({
      host: config.REDIS__HOST,
      port: config.REDIS__PORT,
      password: config.REDIS__PASSWORD,
    });

    this.client.on('error', (error) => console.error(error));
  }

  disConnect() {
    this.client.quit();
  }

  getCache({ key }) {
    return new Promise((resolve, reject) => {
      this.client.get(key, (err, reply) => {
        if (err) reject(err);

        resolve(reply);
      });
    });
  }

  setCache({ key, value }) {
    return new Promise((resolve, reject) => {
      this.client.set(key, JSON.stringify(value), (err) => {
        if (err) reject(err);

        resolve(true);
      });
    });
  }

  removeCache({ key }) {
    return new Promise((resolve, reject) => {
      this.client.del(key, (err, reply) => {
        if (err) reject(err);
        resolve(reply === 1);
      });
    });
  }
}
