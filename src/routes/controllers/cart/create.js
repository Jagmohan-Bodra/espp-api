import { body } from 'express-validator';
import { CUSTOMER_STATUS } from '~/routes/constants/master-data';
import {
  forbidden,
  notFound,
  badRequest,
  successResponse,
} from '~/routes/utils/response';
import errorMessages from '~/routes/constants/error-messages';
import { isObjectId } from '~/routes/utils/validator';
import { getObjectId } from '~/routes/utils';
import ROLES from '~/routes/constants/roles';

export default ({ models }, authenticate, validator) => [
  authenticate(ROLES.CART_CREATE),
  [
    body('productId')
      .custom(isObjectId)
      .withMessage(errorMessages.PRODUCT_ID_INVALID),
  ],
  validator,
  async (req, res) => {
    const { productId, quantity } = req.body;
    const product = await models.Product.findById(productId).exec();

    if (!product) {
      return notFound(res, errorMessages.PRODUCT_NOT_FOUND);
    }
    const { id } = req.context.tokenInfo;
    const customer = await models.Customer.findOne({
      user: getObjectId(id),
    }).exec();

    if (!customer) {
      return notFound(res, errorMessages.CUSTOMER_NOT_FOUND);
    }
    if (customer.status === CUSTOMER_STATUS.PENDING) {
      return forbidden(res, errorMessages.CUSTOMER_SUBSPEND);
    }
    if (customer.status === CUSTOMER_STATUS.SUSPEND) {
      return forbidden(res, errorMessages.CUSTOMER_PENDING);
    }
    if (!customer.user) {
      return notFound(res, errorMessages.USER_NOT_FOUND);
    }
    if (!customer.user.active) {
      return forbidden(res, errorMessages.ACCOUNT_INACTIVE);
    }

    const existsCart = await models.Cart.findOne({
      product: product._id,
      customer: customer._id,
    }).exec();

    if (existsCart) {
      existsCart.set({ quantity });
      await existsCart.save();
      return successResponse(res, existsCart);
    }
    const orderProduct = new models.Cart({
      product: product._id,
      customer: customer._id,
      quantity,
    });
    const errors = orderProduct.validateSync();
    if (errors) {
      return badRequest(res, errors.message);
    }

    await orderProduct.save();
    return successResponse(res, orderProduct);
  },
];
