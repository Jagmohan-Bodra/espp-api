import _ from 'lodash';
import { body, param } from 'express-validator';
import { successResponse, notFound, badRequest } from '~/routes/utils/response';
import { isObjectId } from '~/routes/utils/validator';
import errorMessages from '~/routes/constants/error-messages';
import Models from '~/models';
import { getObjectId } from '~/routes/utils';
import ROLES from '~/routes/constants/roles';

const requestSchema = [
  param('productId')
    .custom(isObjectId)
    .withMessage(errorMessages.PRODUCT_ID_INVALID),
  body('membershipId')
    .custom(isObjectId)
    .withMessage(errorMessages.MEMBERSHIP_ID_INVALID),
  // body('price').isNumeric(),
];

/**
 * @param {Object} deps
 * @param {Models} deps.models
 */
export default ({ models }, authenticate, validator) => [
  authenticate(ROLES.PRODUCT_PRICE_UPDATE),
  requestSchema,
  validator,
  async (req, res) => {
    const { productId } = req.params;
    const { price, membershipId, moq } = req.body;

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

    if (membershipProduct) {
      if (price) {
        membershipProduct.set({ price });
      }
      if (moq || moq == 0) {
        membershipProduct.set({ moq });
      }
      await membershipProduct.save();
      return successResponse(res, membershipProduct);
    }

    const newMembershipProduct = await new models.MembershipProduct({
      membership: getObjectId(membershipId),
      product: getObjectId(productId),
      price,
      moq,
    }).save();

    return successResponse(res, newMembershipProduct);
  },
];
