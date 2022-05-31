import Bull from 'bull';

export default class MessageQueue {
  constructor(config) {
    const redis = {
      host: config.REDIS__HOST,
      port: config.REDIS__PORT,
      password: config.REDIS__PASSWORD,
    };
    this.notification = new Bull('notification', { redis });
    this.publisher = new Bull('publisher', { redis });
  }
}
