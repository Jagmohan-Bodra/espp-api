import _ from 'lodash';
import { param } from 'express-validator';
import Models from '~/models';
import { successResponse, notFound, badRequest } from '~/routes/utils/response';
import { isObjectId } from '~/routes/utils/validator';
import errorMessages from '~/routes/constants/error-messages';
import { mongooseErrMessageHelper } from '~/routes/utils';
import ROLES from '~/routes/constants/roles';

const requestSchema = [
  param('promotionId')
    .custom(isObjectId)
    .withMessage(errorMessages.PROMOTION_ID_INVALID),
];

/**
 * @param {Object} deps
 * @param {Models} deps.models
 */
export default ({ models }, authenticate, validator) => [
  authenticate(ROLES.PROMOTION_UPDATE),
  requestSchema,
  validator,
  async (req, res) => {
    const { promotionId } = req.params;

    const promotion = await models.Promotion.findById(promotionId).exec();
    if (!promotion) {
      return notFound(res, errorMessages.PROMOTION_NOT_FOUND);
    }

    promotion.set(
      _.pick(req.body, [
        'type',
        'percentageValue',
        'cashRebateValue',
        'isFullShippingFee',
        'freeShippingMaximum',
        'name',
        'status',
        'startDate',
        'endDate',
        'applyFor',
        'capacity',
        'content',
        'published',
      ]),
    );

    const errors = promotion.validateSync();
    if (errors) {
      return badRequest(res, errors.message);
    }
    await promotion.save();

    const { product } = req.body;
    if (product && Array.isArray(product)) {
      await models.ProductPromotion.deleteMany({ promotion: promotion._id });
      const data = await models.ProductPromotion.bulkWrite(
        product.map((pItem) => ({
          updateOne: {
            filter: { product: pItem, promotion: promotion._id },
            update: { $set: { product: pItem, promotion: promotion._id } },
            upsert: true,
          },
        })),
      ).catch((err) => err);
      if (data instanceof Error) {
        return badRequest(res, mongooseErrMessageHelper(data));
      }
    }

    return successResponse(res, promotion);
  },
];
