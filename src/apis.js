import express from 'express';
import cors from 'cors';
import hbs from 'express-hbs';

import * as config from '~/config';
import routes from '~/routes';
import Models from '~/models';
import Jwt from '~/wrappers/jwt';
import Cache from '~/clients/cache';
import Mailer from './clients/mailer';
import MessageQueue from './clients/queue';
import Uploader from '~/clients/uploader';

import HtmlTemplate from './handlers/template';
import NotificationHandler from './handlers/notification';
import ApproveHandler from './handlers/approval-requests/approve';
import RejectHandler from './handlers/approval-requests/reject';
import PublisherHandle from './handlers/publisher';

require('express-async-errors');

const app = express();
app.use(cors());
app.use(
  express.urlencoded({
    extended: true,
  }),
);
app.use(express.json());
app.use('/public', express.static('public'));
app.engine(
  'hbs',
  hbs.express4({
    partialsDir: `${__dirname}/handlers/template/templates/partials`,
  }),
);
app.set('view engine', 'hbs');
app.set('views', `${__dirname}/handlers/template/templates`);

// Load Dependancies
const cache = new Cache({ config });
const models = new Models({ config });
const emailClient = new Mailer(config);
const messageQueue = new MessageQueue(config);
const jwt = new Jwt(config.JWT__SECRET_KEY);
const uploadJwt = new Jwt(config.JWT__UPLOAD_SECRET_KEY);
const htmlTemplate = new HtmlTemplate();
const notificationHandler = new NotificationHandler({
  messageQueue,
  emailClient,
  config,
  htmlTemplate,
  cache,
  models,
});
const approveHandler = new ApproveHandler({
  models,
  cache,
  notificationHandler,
});
const rejectHandler = new RejectHandler({ models, cache, notificationHandler });
const publisherHandle = new PublisherHandle({
  messageQueue,
  config,
  models,
});
const uploader = Uploader(
  config.S3_CONFIG,
  1,
  config.S3__BUCKET_NAME_DEFAULT,
  config.S3__FOLDER_DEFAULT,
);

const deps = {
  config,
  models,
  cache,
  jwt,
  uploadJwt,
  htmlTemplate,
  notificationHandler,
  approveHandler,
  rejectHandler,
  publisherHandle,
  uploader,
};

// Inject Dependancies to routes
const server = routes(app, deps).listen(config.PORT, () => {
  console.log(`Listening at port: ${config.PORT}`);
});

const shutdown = () => {
  console.info('SIGTERM signal received.');
  console.log('Closing http server.');
  return server.close(async () => {
    console.log('Http server closed.');
    await models.close().then(() => console.log('MongoDb connection closed.'));
    if (cache.disConnect()) console.log('redis connection close');
    process.exit(0);
  });
};

module.exports = { server, shutdown };

process.on('SIGTERM', shutdown);
