import _ from 'lodash';
import { body } from 'express-validator';
import moment from 'moment';
import {
  badRequest,
  notFound,
  successResponse,
  forbidden,
} from '~/routes/utils/response';
import { isObjectId } from '~/models/util';
import errorMessages from '~/routes/constants/error-messages';
import createOrderProduct from './create-order-product';
import { getObjectId } from '~/routes/utils';
import ROLES from '~/routes/constants/roles';
import {
  CUSTOMER_STATUS,
  PAYMENT_OPTION,
  PAYMENT_STATUS,
} from '~/routes/constants/master-data';
import { CREATE_ORDER_PUBLISHER } from '~/handlers/publisher/type';

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

const filterValidCarts = async (models, cartIds, customerId) => {
  const totalCart = await models.Cart.find({
    customer: customerId,
  }).exec();

  const totalCartId = totalCart.map((item) => item._id.toHexString());

  return cartIds.filter((cartId) =>
    totalCartId.find((item) => cartId === item),
  );
};

const computeOrder = (orderProducts) => {
  const total = orderProducts.reduce((value, item) => value + item.total, 0);
  const subTotal = orderProducts.reduce(
    (value, item) => value + item.subTotal,
    0,
  );

  return { total, subTotal, membershipDiscount: total - subTotal };
};

const createOrder = async (
  { models, cache },
  customer,
  params,
  orderProducts,
) => {
  const { total, subTotal, membershipDiscount } = computeOrder(orderProducts);
  const { orderNo, count, keyCache } = await getOrderNo({ models, cache });
  const order = await new models.Order({
    customer: customer._id,
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

const deleteValidCarts = async (models, validCarts) =>
  models.Cart.deleteMany({ _id: { $in: validCarts } });

/**
 * @param {Object} deps
 * @param {Models} deps.models
 */
export default (
  { models, cache, publisherHandle },
  authenticate,
  validator,
) => [
  authenticate(ROLES.ORDER_CREATE),
  [body('cartIds').isArray(), body('cartIds.*').custom(isObjectId)],
  validator,
  async (req, res) => {
    const { cartIds } = req.body;
    const userId = req.context.tokenInfo.id;

    const customer = await models.Customer.findOne({
      user: getObjectId(userId),
    }).exec();
    if (!customer) {
      return notFound(res, errorMessages.CUSTOMER_NOT_FOUND);
    }
    if (customer.status !== CUSTOMER_STATUS.ACTIVE) {
      return forbidden(res);
    }
    const { membership } = customer;

    const validCarts = await filterValidCarts(models, cartIds, customer._id);
    const carts = await models.Cart.find({ _id: { $in: validCarts } }).exec();

    // const orderProducts = await Promise.all(
    //   carts.map(createOrderProduct(models, membership)),
    // );

    // Check quantity product
    let checkQuantity = true;
    carts.forEach((cart) => {
      if (cart.product.quantity < cart.quantity) {
        checkQuantity = false;
      }
    });
    if (!checkQuantity) {
      return badRequest(res, errorMessages.ORDER_QUANTITY_INVALID);
    }

    const orderProductData = await Promise.all(
      carts.map(createOrderProduct(models, membership)),
    );

    const orderProducts = await models.OrderProduct.bulkWrite(
      orderProductData.map((item) => ({
        insertOne: {
          document: item,
        },
      })),
    );
    const orderProductsList = await models.OrderProduct.find({
      _id: { $in: Object.values(orderProducts.insertedIds || {}) },
    });

    const order = await createOrder(
      { models, cache },
      customer,
      req.body,
      orderProductsList,
    );
    if (order.errors) {
      return badRequest(res, order.errors);
    }

    // Update quantity product
    await models.Product.bulkWrite(
      carts.map((cart) => ({
        updateOne: {
          filter: { _id: cart.product._id },
          update: {
            $set: {
              quantity: cart.product.quantity - cart.quantity,
              sold: cart.product.sold + cart.quantity,
            },
          },
        },
      })),
    );

    await deleteValidCarts(models, validCarts);

    // publisher
    await publisherHandle.publish(CREATE_ORDER_PUBLISHER, order);

    return successResponse(res, order);
  },
];
