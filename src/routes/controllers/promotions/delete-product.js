import { param } from 'express-validator';
import { isObjectId } from '~/models/util';
import errorMessages from '~/routes/constants/error-messages';
import ROLES from '~/routes/constants/roles';

import { getObjectId } from '~/routes/utils';
import { notFound, successResponse } from '~/routes/utils/response';

export default ({ models }, authenticate, validator) => [
  authenticate(ROLES.PROMOTION_REMOVEPRODUCT),
  [
    param('promotionId')
      .custom(isObjectId)
      .withMessage(errorMessages.PROMOTION_ID_INVALID),
    param('productId')
      .custom(isObjectId)
      .withMessage(errorMessages.PRODUCT_ID_INVALID),
  ],
  validator,
  async (req, res) => {
    const promotion = await models.Promotion.findById(req.params.promotionId);
    if (!promotion) {
      return notFound(res, errorMessages.PROMOTION_NOT_FOUND);
    }

    const product = await models.Product.findById(req.params.productId);
    if (!product) {
      return notFound(res, errorMessages.PRODUCT_NOT_FOUND);
    }

    const productPromotion = await models.ProductPromotion.findOne({
      promotion: getObjectId(req.params.promotionId),
      product: getObjectId(req.params.productId),
    });
    if (!productPromotion) {
      return notFound(res, errorMessages.PRODUCT_PROMOTION_IS_NOT_EXISTS);
    }
    await productPromotion.deleteOne();

    return successResponse(res, productPromotion);
  },
];
