import * as config from '~/config';
import Mailer from './clients/mailer';
import MessageQueue from './clients/queue';

import HtmlTemplate from './handlers/template';
import NotificationHandler from './handlers/notification';
import Models from './models';
import Cache from '~/clients/cache';

require('events').EventEmitter.defaultMaxListeners = 100;

// Load Dependancies
const emailClient = new Mailer(config);
const messageQueue = new MessageQueue(config);
const htmlTemplate = new HtmlTemplate();
const cache = new Cache({ config });
const models = new Models({ config });

const notificationHandler = new NotificationHandler({
  messageQueue,
  emailClient,
  config,
  htmlTemplate,
  cache,
  models,
});

messageQueue.notification.process(async (job, done) => {
  const { eventType, payload } = job.data;
  return notificationHandler
    .factory(eventType)
    .pushNotif(payload)
    .then(() => console.log(eventType, 'Run Success!'))
    .catch((err) => console.log(eventType, err))
    .then(() => done());
});

console.log('Awaiting to a message');
