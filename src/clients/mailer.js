import nodemailer from 'nodemailer';
import _ from 'lodash';

export default class Mailer {
  constructor(config) {
    this.config = config;
    const { host, port, auth, secure } = config;
    this.transport = nodemailer.createTransport({
      host,
      port,
      secure,
      auth,
      tls: {
        rejectUnauthorized: false,
      },
    });
  }

  verify() {
    return new Promise((resolve, reject) => {
      this.transport.verify((err) => {
        if (err) {
          return reject(new Error('Email config incorrect!'));
        }
        return resolve();
      });
    });
  }

  sendMail(sendTo, title, body) {
    const { publicName, senderName } = this.config;
    return new Promise((resolve, reject) => {
      this.transport.sendMail(
        {
          from: `${publicName} <${senderName}>`,
          to: sendTo,
          subject: title,
          html: body,
        },
        (err, info) => {
          if (err) {
            return reject(err);
          }
          return resolve(info);
        },
      );
    });
  }

  sendMailv2(config, sendTo, title, body) {
    const { publicName, senderName, host, port, auth, secure } = config;

    if (!_.isEqual(config, this.config)) {
      const transport = nodemailer.createTransport({
        host,
        port,
        secure,
        auth,
        tls: {
          rejectUnauthorized: false,
        },
      });
      this.transport = transport;
      this.config = config;
    }

    return new Promise((resolve, reject) => {
      this.transport.sendMail(
        {
          from: `${publicName} <${senderName}>`,
          to: sendTo,
          subject: title,
          html: body,
        },
        (err, info) => {
          if (err) {
            return reject(err);
          }
          return resolve(info);
        },
      );
    });
  }
}
