import { param } from 'express-validator';
import { isObjectId } from '~/routes/utils/validator';

import { notFound, successResponse } from '~/routes/utils/response';
import errorMessages from '~/routes/constants/error-messages';
import Models from '~/models';
import { getObjectId } from '~/routes/utils';
import ROLES from '~/routes/constants/roles';

const payloadSchema = [
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
  authenticate(ROLES.PRODUCT_PRICE_GET),
  payloadSchema,
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

    const _getPrice = () => {
      if (membershipProduct) {
        return membershipProduct.price;
      }

      const { publicPrice } = product;
      const { discountPercent } = membership;
      const price = (publicPrice * (100 - discountPercent)) / 100;
      return Number(price.toFixed(6));
    };

    return successResponse(res, {
      product: productId,
      membership: membership._id.toHexString(),
      price: _getPrice(),
      moq: membershipProduct ? membershipProduct.moq : 0,
    });
  },
];
