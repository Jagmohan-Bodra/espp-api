import { param } from 'express-validator';
import mongoose from 'mongoose';
import { isObjectId } from '~/routes/utils/validator';
import errorMessages from '~/routes/constants/error-messages';
import ROLES from '~/routes/constants/roles';
import { getObjectId } from '~/routes/utils';
import { notFound, successResponse } from '~/routes/utils/response';

export default ({ models }, authenticate, validator) => [
  authenticate(ROLES.CART_GETLIST),
  [
    param('cartId')
      .custom(isObjectId)
      .withMessage(errorMessages.CART_ID_INVALID),
  ],
  validator,
  async (req, res) => {
    const { id } = req.context.tokenInfo;
    const customer = await models.Customer.findOne({
      user: getObjectId(id),
    }).exec();
    if (!customer) {
      return notFound(res, errorMessages.CUSTOMER_NOT_FOUND);
    }

    const cart = await models.Cart.findById(req.params.cartId).exec();

    if (!cart) {
      return notFound(res, errorMessages.CART_NOT_FOUND);
    }

    return successResponse(res, cart);
  },
];
