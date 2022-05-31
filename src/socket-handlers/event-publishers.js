// import { getUserSocket } from './utils';
const CREATE_CUSTOMER_PUBLISHER =
  'ClientEvent::/integrations/crm/create-customer';
const UPDATE_CUSTOMER_PUBLISHER =
  'ClientEvent::/integrations/crm/update-customer';
const DELETE_CUSTOMER_PUBLISHER =
  'ClientEvent::/integrations/crm/delete-customer';

const CREATE_ORDER_PUBLISHER =
  'ClientEvent::/integrations/crm/create-sale-order';
const UPDATE_STATUS_ORDER_PUBLISHER =
  'ClientEvent::/integrations/crm/status-update';
const UPDATE_CANCEL_ORDER_PUBLISHER =
  'ClientEvent::/integrations/crm/cancel-sale-order';

export default ({ io }) => ({
  createCustomerPublishser: (payload) => {
    io.emit(CREATE_CUSTOMER_PUBLISHER, payload);
  },
  updateCustomerPublishser: (payload) => {
    io.emit(UPDATE_CUSTOMER_PUBLISHER, payload);
  },
  deleteCustomerPublishser: (payload) => {
    io.emit(DELETE_CUSTOMER_PUBLISHER, payload);
  },

  createOrderPublishser: (payload) => {
    io.emit(CREATE_ORDER_PUBLISHER, payload);
  },
  updateOrderPublishser: (payload) => {
    io.emit(UPDATE_STATUS_ORDER_PUBLISHER, payload);
  },
  updateCancelOrderPublishser: (payload) => {
    io.emit(UPDATE_CANCEL_ORDER_PUBLISHER, payload);
  },
});
