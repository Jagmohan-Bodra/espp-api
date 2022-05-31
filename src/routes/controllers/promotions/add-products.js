import { param } from 'express-validator';
import { isObjectId } from '~/models/util';
import errorMessages from '~/routes/constants/error-messages';
import ROLES from '~/routes/constants/roles';

import { getObjectId, mongooseErrMessageHelper } from '~/routes/utils';
import { badRequest, notFound, successResponse } from '~/routes/utils/response';

export default ({ models }, authenticate, validator) => [
  authenticate(ROLES.PROMOTION_ADDPRODUCT),
  [
    param('promotionId')
      .custom(isObjectId)
      .withMessage(errorMessages.PROMOTION_ID_INVALID),
  ],
  validator,
  async (req, res) => {
    const { product } = req.body;
    const promotion = await models.Promotion.findById(req.params.promotionId);
    if (!promotion) {
      return notFound(res, errorMessages.PROMOTION_NOT_FOUND);
    }
    if (product && Array.isArray(product)) {
      const data = models.ProductPromotion.bulkWrite(
        product.map((pItem) => ({
          updateOne: {
            filter: { product: getObjectId(pItem), promotion: promotion._id },
            update: { $set: { product: pItem, promotion: promotion._id } },
            upsert: true,
          },
        })),
      ).catch((err) => err);
      if (data instanceof Error) {
        return badRequest(res, mongooseErrMessageHelper(data));
      }
    }

    return successResponse(res);
  },
];
