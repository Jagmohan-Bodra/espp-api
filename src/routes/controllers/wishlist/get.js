import { param } from 'express-validator';
import { isObjectId } from '~/routes/utils/validator';
import errorMessages from '~/routes/constants/error-messages';
import { getObjectId } from '~/routes/utils';
import { notFound, successResponse } from '~/routes/utils/response';

export default ({ models }, validator) => [
  [
    param('wishlistId')
      .custom(isObjectId)
      .withMessage(errorMessages.ID_INVALID),
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

    const wishlist = await models.Wishlist.findById(
      req.params.wishlistId,
    ).exec();

    if (!wishlist) {
      return notFound(res, errorMessages.NOT_FOUND);
    }

    return successResponse(res, wishlist);
  },
];
