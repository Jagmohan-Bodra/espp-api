import { param } from 'express-validator';
import errorMessages from '~/routes/constants/error-messages';
import ROLES from '~/routes/constants/roles';
import { getObjectId } from '~/routes/utils';
import { notFound, successResponse } from '~/routes/utils/response';
import { isObjectId } from '~/routes/utils/validator';

export default ({ models }, authenticate, validator) => [
  authenticate(ROLES.CART_DELETE),
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

    const cart = await models.Cart.findOne({
      _id: getObjectId(req.params.cartId),
      customer: customer._id,
    }).exec();

    if (!cart) {
      return notFound(res, errorMessages.CART_NOT_FOUND);
    }

    await cart.deleteOne();

    return successResponse(res, cart);
  },
];
