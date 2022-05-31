import { param } from 'express-validator';
import { isObjectId } from '~/routes/utils/validator';

import { notFound, successResponse } from '~/routes/utils/response';
import errorMessages from '~/routes/constants/error-messages';
import Models from '~/models';
import ROLES from '~/routes/constants/roles';

const payloadSchema = [
  param('promotionId')
    .custom(isObjectId)
    .withMessage(errorMessages.PROMOTION_ID_INVALID),
];

/**
 * @param {Object} deps
 * @param {Models} deps.models
 */
export default ({ models }, authenticate, validator) => [
  authenticate(ROLES.PROMOTION_GET),
  payloadSchema,
  validator,
  async (req, res) => {
    const { promotionId } = req.params;

    const promotion = await models.Promotion.findById(promotionId).exec();
    if (!promotion) {
      return notFound(res, errorMessages.PROMOTION_NOT_FOUND);
    }

    const productPromotion = await models.ProductPromotion.find({
      promotion: promotion._id,
    })
      .populate('product')
      .exec();
    const products = productPromotion.map((item) => item.product);
    return successResponse(res, { ...promotion.toObject(), product: products });
  },
];
