import _ from 'lodash';
import { param } from 'express-validator';
import { isObjectId } from '../../../models/util';
import errorMessages from '~/routes/constants/error-messages';
import { notFound, successResponse } from '~/routes/utils/response';
import Models from '~/models';
import { getObjectId } from '~/routes/utils';
import ROLES from '~/routes/constants/roles';

/**
 * @param {Object} deps
 * @param {Models} deps.models
 */
export default ({ models }, authenticate, validator) => [
  authenticate(ROLES.PRODUCT_PRICE_GETLIST),
  [
    param('productId')
      .custom(isObjectId)
      .withMessage(errorMessages.PRODUCT_ID_INVALID),
  ],
  validator,
  async (req, res) => {
    const { productId } = req.params;

    const product = await models.Product.findById(productId).exec();
    if (!product) {
      return notFound(res, errorMessages.PRODUCT_NOT_FOUND);
    }

    const memberships = await models.Membership.find({}).exec();

    const membershipProducts = await models.MembershipProduct.find({
      product: getObjectId(productId),
    }).exec();

    const _getMembershipProduct = (membership) => {
      const _getPrice = () => {
        const existMembershipProduct = membershipProducts.find(
          (item) =>
            item.membership.toHexString() === membership._id.toHexString(),
        );

        if (existMembershipProduct) {
          return existMembershipProduct.price;
        }

        const { discountPercent } = membership;
        const { publicPrice } = product;
        const price = (publicPrice * (100 - discountPercent)) / 100;
        return Number(price.toFixed(6));
      };
      const existMembershipProduct = membershipProducts.find(
        (item) =>
          item.membership.toHexString() === membership._id.toHexString(),
      );

      return {
        product: productId,
        membership: membership._id.toHexString(),
        price: _getPrice(),
        moq: existMembershipProduct ? existMembershipProduct.moq : 0,
      };
    };

    return successResponse(res, memberships.map(_getMembershipProduct));
  },
];
