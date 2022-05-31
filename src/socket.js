import { createServer } from 'http';
import contextCreator from './socket-handlers/middlewares/context-creator';
import authorized from './socket-handlers/middlewares/authorized';
import * as config from '~/config';
import Models from './models';
import Jwt from '~/wrappers/jwt';
import Cache from '~/clients/cache';
import EventPublishers from './socket-handlers/event-publishers';
// import { getUserSocket } from './socket-handlers/utils';
import {
  createCustomerListener,
  createOrderListener,
  deleteCustomerListener,
  updateCustomerListener,
  updateOrderStatusCancelListener,
  updateOrderStatusListener,
} from './socket-handlers/event-listeners';
import MessageQueue from './clients/queue';
import PublisherHandle from './handlers/publisher';

require('events').EventEmitter.defaultMaxListeners = 100;

const cache = new Cache({ config });
const models = new Models({ config });
const jwt = new Jwt(config.JWT__SECRET_KEY);
const messageQueue = new MessageQueue(config);

const deps = {
  jwt,
  models,
  cache,
};

const httpServer = createServer();
const io = require('socket.io')(httpServer, {});

io.use(contextCreator(deps));
io.use(authorized(deps));

const eventPublishers = EventPublishers({ ...deps, io });

const publisherHandle = new PublisherHandle({
  ...deps,
  io,
  eventPublishers,
  messageQueue,
});

io.on('connection', (socket) => {
  console.log('connected!');
  // const { auth } = socket.handshake;
  // const { tokenInfo } = auth || {};
  // const { id } = tokenInfo || {};
  // socket.join(getUserSocket(id));

  // Event listeners
  socket.on(
    'ServerEvent::/integrations/crm/create-customer',
    createCustomerListener(deps, socket),
  );
  socket.on(
    'ServerEvent::/integrations/crm/update-customer',
    updateCustomerListener(deps, socket),
  );
  socket.on(
    'ServerEvent::/integrations/crm/delete-customer',
    deleteCustomerListener(deps, socket),
  );

  socket.on(
    'ServerEvent::/integrations/crm/create-sale-order',
    createOrderListener(deps, socket),
  );
  socket.on(
    'ServerEvent::/integrations/crm/status-update',
    updateOrderStatusListener(deps, socket),
  );
  socket.on(
    'ServerEvent::/integrations/crm/cancel-sale-order',
    updateOrderStatusCancelListener(deps, socket),
  );
});

messageQueue.publisher.process(async (job, done) => {
  const { eventType, payload } = job.data;
  publisherHandle
    .factory(eventType)
    .publish(payload)
    .then(() => console.log(eventType, 'Run Success!'))
    .catch((err) => console.log(eventType, err))
    .then(() => done());
});

httpServer.listen(config.SOCKET_PORT, () => {
  console.log(`Listening at port: ${config.SOCKET_PORT}`);
});
