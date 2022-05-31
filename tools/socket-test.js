const md5 = require('md5');
const io = require('socket.io-client');
const adminToken =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjUxNDNhZmM2NmQ0NGUxY2ViMzc1NDAwMSIsImlhdCI6MTYzMjEyNTYxNH0.Ta6K3r11LnKtFjKTMoHMVt3oM4-qUJiJ2TM8-MNhLLk';

const host = 'http://localhost:3001';

const CREATE_CUSTOMER_PUBLISHER = 'ClientEvent::/integrations/crm/create-customer';
const UPDATE_CUSTOMER_PUBLISHER = 'ClientEvent::/integrations/crm/update-customer';
const DELETE_CUSTOMER_PUBLISHER = 'ClientEvent::/integrations/crm/delete-customer';
const CREATE_ORDER_PUBLISHER = 'ClientEvent::/integrations/crm/create-sale-order';
const UPDATE_STATUS_ORDER_PUBLISHER = 'ClientEvent::/integrations/crm/status-update';
const UPDATE_CANCEL_ORDER_PUBLISHER = 'ClientEvent::/integrations/crm/cancel-sale-order';

const sessionCreator = (name, token) => {
  const socket = io(host, {
    transportOptions: {
      polling: {
        extraHeaders: {
          authorization: `Bearer ${token}`,
        },
      },
    },
  });

  socket.on('connect', () => {
    console.log(name, 'Connected!');
    socket.on(CREATE_CUSTOMER_PUBLISHER, (payload) => {
      console.log(name, CREATE_CUSTOMER_PUBLISHER, payload);
    });

    socket.on(UPDATE_CUSTOMER_PUBLISHER, (payload) => {
      console.log(name, UPDATE_CUSTOMER_PUBLISHER, payload);
    });

    socket.on(DELETE_CUSTOMER_PUBLISHER, (payload) => {
      console.log(name, DELETE_CUSTOMER_PUBLISHER, payload);
    });

    socket.on(CREATE_ORDER_PUBLISHER, (payload) => {
      console.log(name, CREATE_ORDER_PUBLISHER, payload);
    });

    socket.on(UPDATE_STATUS_ORDER_PUBLISHER, (payload) => {
      console.log(name, UPDATE_STATUS_ORDER_PUBLISHER, payload);
    });

    socket.on(UPDATE_CANCEL_ORDER_PUBLISHER, (payload) => {
      console.log(name, UPDATE_CANCEL_ORDER_PUBLISHER, payload);
    });
  });

  socket.on('connect_error', (err) => {
    console.log(name, err.message);
  });
};

const emiter = (token) => {
  const socket = io(host, {
    transportOptions: {
      polling: {
        extraHeaders: {
          tenantId: 1,
          authorization: `Bearer ${token}`,
        },
      },
    },
  });
  console.log('connecting...');
  return ({
    subscribe: (event, payload) => {
      socket.emit(event, payload, (results) => console.log(event, results))
    }
  })

  // socket.on('connect', () => {
  //   console.log('connected!');
  //   socket.emit('Server::/chats/send-message', {
  //     conversationId: 1,
  //     textMessage: 'Tuan test more',
  //     attachmentLink: 'url',
  //   });
  // });
};

// Run Fist to listen
sessionCreator('ADMIN=========\n', adminToken);

// Run after that for emit
// const emiterController = emiter(adminToken);
// emiterController.subscribe('ServerEvent::/integrations/crm/create-customer', {
//   // "id": "string",
//   "status": "ACTIVE",
//   "addresses": [
//     {
//       "address": "string",
//       "is_default": true
//     }
//   ],
//   "account": {
//     "phone": "012456789",
//     "email": "customer_test@gmail.com",
//     "firstName": "Jonh",
//     "lastName": "Doe",
//     "birthday": "1991-01-20",
//     "password": md5('123456'),
//   }
// });

// emiterController.subscribe('ServerEvent::/integrations/crm/update-customer', {
//   "id": "614852090d0aa94a322718a4",
//   "status": "ACTIVE",
//   "addresses": [
//     {
//       "address": "string",
//       "is_default": true
//     }
//   ],
//   "account": {
//     "phone": "012456789",
//     "email": "customer_update_test@gmail.com",
//     "firstName": "Jonh",
//     "lastName": "Doe",
//     "birthday": "1991-01-20",
//     "password": md5('123456'),
//   }
// });

// emiterController.subscribe('ServerEvent::/integrations/crm/delete-customer', {
//   "email": "user108@gmail.com",
//   "phone": "123456218"
// });

// emiterController.subscribe('ServerEvent::/integrations/crm/create-po', {
//   "customerId": "614854e19f556a501f973f11",
//   "orderStatus": "PENDING",
//   "shippingFee": 0,
//   "paymentMethod": "CASH_ON_DELIVERY",
//   "paymentStatus": "UNPAID",
//   "orderDateTime": "2021-07-30T02:52:56.000Z",
//   "notes": "This is a note 12345678",
//   "grandTotal": 47040,
//   "purchaseOrder": "29838273",
//   "order": [
//     {
//       "productId": "string",
//       "product": {
//         "id": "string",
//         "barcode": "10000003",
//         "name": "product name 3",
//         "sku": "PRODUCT_3",
//         "description": "Description 3",
//         "publicPrice": "1200",
//         "currentcy": "sgd",
//         "uom": "DZ",
//         "attributes": {
//           "color": "RED",
//           "brand": "string",
//           "size": "3",
//           "typeAndMaterial": "unknow"
//         }
//       },
//       "quantity": 15,
//       "salePrice": 1176,
//       "total": 18000,
//       "subTotal": 17000,
//       "createdAt": "2021-07-30T02:52:56.441Z",
//       "updatedAt": "2021-07-30T02:52:56.441Z"
//     }
//   ],
//   "shippingAddress": {
//     "firstName": "first 28",
//     "lastName": "Last 29",
//     "phone": "123456216",
//     "blockNo": "2",
//     "stresstName": "124 Alexandre de Rhodes New York NEW YORK USA",
//     "floor": "3",
//     "unitNo": "124",
//     "buildingName": "Empire State Building",
//     "state": "NEW YORK",
//     "country": "USA",
//     "city": "New York",
//     "postCode": "74000"
//   },
//   "billingAddress": {
//     "contact": {
//       "firstName": "first 28",
//       "lastName": "Last 29",
//       "phone": "123456216",

//     },
//     "address": {
//       "blockNo": "2",
//       "buildingName": "Empire State Building",
//       "floor": "3",
//       "unitNo": "124",
//       "stresstName": "124 Alexandre de Rhodes New York NEW YORK USA",
//       "state": "NEW YORK",
//       "city": "New York",
//       "country": "USA",
//       "postCode": "74000"
//     }
//   }
// });

// emiterController.subscribe('ServerEvent::/integrations/crm/status-update', {
//   "orderNo": "21092000001",
//   "status": "CANCELLED",
// });

// emiterController.subscribe('ServerEvent::/integrations/crm/cancel-po', {
//   "orderNo": "21092000001",
//   "cancelReason": "text"
// });