import _ from 'lodash';
import moment from 'moment';
import { USER_GROUP_CUSTOMER_ID } from '~/routes/constants/constant';
import {
  ORDERS_STATUS,
  PAYMENT_OPTION,
  PAYMENT_STATUS,
} from '~/routes/constants/master-data';
import { mongooseErrMessageHelper } from '~/routes/utils';
import { successRes, throwErr } from './helper/response';

// TODO: Validation request
export const createCustomerListener = (deps, socket) => async (
  payload,
  cb = () => {},
) => {
  const { auth } = socket.handshake;
  const { models } = auth || {};
  const params = _.pick(payload, ['status', 'addresses', 'account']);

  const userData = new models.User({
    ...(params.account || {}),
    name: `${(params.account || {}).firstName || ''} ${
      (params.account || {}).lastName || ''
    }`,
    userGroup: USER_GROUP_CUSTOMER_ID,
  });
  const userErrors = userData.validateSync();
  if (userErrors) {
    return throwErr(cb, 'Bad request');
  }

  const isDuplicateEmail = await models.User.findOne({
    email: params.account.email,
  }).exec();
  if (isDuplicateEmail) {
    return throwErr(cb, 'Email is existed');
  }

  const data = new models.Customer({
    status: params.status,
    addresses: params.addresses,
  });
  const errors = data.validateSync();
  if (errors) {
    return throwErr(cb, 'Bad request');
  }

  await userData.save().catch((err) => err);
  if (userData instanceof Error) {
    return throwErr(cb, 'Validate Error', mongooseErrMessageHelper(userData));
  }
  data.user = userData._id;
  await data.save().catch((err) => err);
  if (data instanceof Error) {
    return throwErr(cb, 'Validate Error', mongooseErrMessageHelper(data));
  }

  return successRes(cb, data);
};

export const updateCustomerListener = (deps, socket) => async (
  payload,
  cb = () => {},
) => {
  const { auth } = socket.handshake;
  const { models } = auth || {};
  const params = _.pick(payload, ['id', 'status', 'addresses', 'account']);

  const customer = await models.Customer.findById(params.id);
  if (!customer) {
    return throwErr(cb, 'Not found');
  }

  if (customer.user) {
    const user = await models.User.findOne({
      _id: customer.user._id,
    });
    if (!user) {
      return throwErr(cb, 'User not found');
    }
    user.set(params.account);
    const updatedUser = await user.save().catch((err) => err);
    if (updatedUser instanceof Error) {
      return throwErr(
        cb,
        'Validate Error',
        mongooseErrMessageHelper(updatedUser),
      );
    }
  }

  customer.set({
    status: params.status,
    addresses: params.addresses,
    user: (params.account || {}).id
      ? params.account.id
      : (customer.user || {})._id,
  });

  const errors = customer.validateSync();
  if (errors) {
    return throwErr(cb, 'Bad request');
  }

  const updatedCustomer = await customer.save().catch((err) => err);
  if (updatedCustomer instanceof Error) {
    return throwErr(
      cb,
      'Validate Error',
      mongooseErrMessageHelper(updatedCustomer),
    );
  }

  return successRes(cb, updatedCustomer);
};

export const deleteCustomerListener = (deps, socket) => async (
  payload,
  cb = () => {},
) => {
  const { auth } = socket.handshake;
  const { models } = auth || {};
  const params = _.pick(payload, ['email', 'phone']);
  const user = await models.User.findOne(params);
  if (!user) {
    return throwErr(cb, 'User not found');
  }

  const customer = await models.Customer.findOne({ user: user._id });
  if (!customer) {
    return throwErr(cb, 'Customer not found');
  }
  await models.InternalNote.deleteMany({ customer: customer._id });
  await customer.deleteOne();
  return successRes(cb, customer);
};

const getCountByDate = async ({ models, cache }, dateStr) => {
  const keyCache = `ORDER${dateStr}`;
  let count = await cache.getCache({ key: keyCache });
  if (!count) {
    count = await models.Order.count({ orderNo: { $regex: dateStr } });
  }
  return parseInt(count, 10) + 1;
};
const getOrderNo = async ({ models, cache }) => {
  const dateStr = moment().format('YYMMDD');
  const count = `00000${await getCountByDate(
    { models, cache },
    dateStr,
  )}`.slice(-5);
  return {
    orderNo: `${dateStr}${count}`,
    count: parseInt(count, 10),
    keyCache: `ORDER${dateStr}`,
  };
};

const computeOrder = (orderProducts) => {
  const total = orderProducts.reduce((value, item) => value + item.total, 0);
  const subTotal = orderProducts.reduce(
    (value, item) => value + (item.subTotal || 0),
    0,
  );

  return { total, subTotal, membershipDiscount: total - subTotal };
};

const createOrder = async (
  { models, cache },
  customerId,
  params,
  orderProducts,
) => {
  const { total, subTotal, membershipDiscount } = computeOrder(orderProducts);
  const { orderNo, count, keyCache } = await getOrderNo({ models, cache });
  const order = await new models.Order({
    customer: customerId,
    orderProducts: orderProducts.map((item) => item._id),
    membershipDiscount,
    total: total + parseFloat(params.shippingFee || 0),
    subTotal,
    shippingAddress: params.shippingAddress,
    billingAddress: params.billingAddress,
    shippingFee: params.shippingFee,
    payment: PAYMENT_OPTION.CASH_ON_DELIVERY,
    paymentStatus: PAYMENT_STATUS.UNPAID,
    orderDateTime: moment().format(),
    orderNo,
    purchaseOrder: params.purchaseOrder,
    notes: params.notes,
  });
  const errors = order.validateSync();
  if (errors) {
    return { errors: errors.message };
  }
  await order.save();
  await cache.setCache({ key: keyCache, value: count });
  return order;
};

export const createOrderListener = ({ cache }, socket) => async (
  payload,
  cb = () => {},
) => {
  const { auth } = socket.handshake;
  const { models } = auth || {};
  const params = _.pick(payload, [
    'customerId',
    'orderStatus',
    'shippingFee',
    'paymentMethod',
    'paymentStatus',
    'orderDateTime',
    'notes',
    'grandTotal',
    'purchaseOrder',
    'order',
    'shippingAddress',
    'billingAddress',
  ]);

  const order = await createOrder(
    { models, cache },
    params.customerId,
    params,
    params.order,
  );
  if (order.errors) {
    return throwErr(cb, 'Validate Error', order.errors);
  }

  return successRes(cb, order);
};

export const updateOrderStatusListener = (deps, socket) => async (
  payload,
  cb = () => {},
) => {
  const { auth } = socket.handshake;
  const { models } = auth || {};
  const { orderNo, status } = _.pick(payload, ['orderNo', 'status']);
  const order = await models.Order.findOne({ orderNo }).exec();
  if (!order) {
    return throwErr(cb, 'Not found');
  }

  order.set({ status });
  const errors = order.validateSync();
  if (errors) {
    return throwErr(cb, 'Bad request');
  }

  const updatedOrder = await order.save().catch((err) => err);
  if (updatedOrder instanceof Error) {
    return throwErr(
      cb,
      'Validate Error',
      mongooseErrMessageHelper(updatedOrder),
    );
  }

  return successRes(cb, updatedOrder);
};

export const updateOrderStatusCancelListener = (deps, socket) => async (
  payload,
  cb = () => {},
) => {
  const { auth } = socket.handshake;
  const { models } = auth || {};
  const { orderNo, cancelReason } = _.pick(payload, [
    'orderNo',
    'cancelReason',
  ]);
  const order = await models.Order.findOne({ orderNo }).exec();
  if (!order) {
    return throwErr(cb, 'Not found');
  }

  order.set({ status: ORDERS_STATUS.CANCELLED, cancelReason });
  const errors = order.validateSync();
  if (errors) {
    return throwErr(cb, 'Bad request');
  }

  const updatedOrder = await order.save().catch((err) => err);
  if (updatedOrder instanceof Error) {
    return throwErr(
      cb,
      'Validate Error',
      mongooseErrMessageHelper(updatedOrder),
    );
  }

  return successRes(cb, updatedOrder);
};
