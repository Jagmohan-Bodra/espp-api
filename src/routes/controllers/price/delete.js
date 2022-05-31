import { param } from 'express-validator';
import Models from '~/models';
import errorMessages from '~/routes/constants/error-messages';
import ROLES from '~/routes/constants/roles';

import { getObjectId } from '~/routes/utils';
import { notFound, successResponse } from '~/routes/utils/response';
import { isObjectId } from '~/routes/utils/validator';

const rules = [
  param('productId')
    .custom(isObjectId)
    .withMessage(errorMessages.PRODUCT_ID_INVALID),
  param('membershipId')
    .optional()
    .custom(isObjectId)
    .withMessage(errorMessages.MEMBERSHIP_ID_INVALID),
];

/**
 * @param {Object} deps
 * @param {Models} deps.models
 */
export default ({ models }, authenticate, validator) => [
  authenticate(ROLES.PRODUCT_PRICE_DELETE),
  rules,
  validator,
  async (req, res) => {
    const { productId, membershipId } = req.params;

    const product = await models.Product.findById(productId).exec();
    if (!product) {
      return notFound(res, errorMessages.PRODUCT_NOT_FOUND);
    }

    const membership = await models.Membership.findById(membershipId).exec();
    if (!membership) {
      return notFound(res, errorMessages.MEMBERSHIP_NOT_FOUND);
    }

    const membershipProduct = await models.MembershipProduct.findOne({
      membership: getObjectId(membershipId),
      product: getObjectId(productId),
    });

    if (!membershipProduct) {
      return notFound(res, errorMessages.MEMBERSHIP_PRODUCT_NOT_FOUND);
    }

    await membershipProduct.deleteOne();

    return successResponse(res, membershipProduct);
  },
];
