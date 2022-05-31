import _ from 'lodash';
import Models from '~/models';
import ROLES from '~/routes/constants/roles';

import { mongooseErrMessageHelper } from '~/routes/utils';
import { badRequest, successResponse } from '~/routes/utils/response';

/**
 * @param {Object} deps
 * @param {Models} deps.models
 */
export default ({ models }, authenticate) => [
  authenticate(ROLES.PROMOTION_CREATE),
  async (req, res) => {
    const newPromotion = new models.Promotion({
      ..._.pick(req.body, [
        'type',
        'name',
        'percentageValue',
        'cashRebateValue',
        'isFullShippingFee',
        'freeShippingMaximum',
        'status',
        'startDate',
        'endDate',
        'applyFor',
        'capacity',
        'content',
        'published',
      ]),
    });

    const errors = newPromotion.validateSync();
    if (errors) {
      return badRequest(res, errors.message);
    }
    await newPromotion.save();

    const { product } = req.body;
    if (product && Array.isArray(product)) {
      const data = await models.ProductPromotion.bulkWrite(
        product.map((pItem) => ({
          updateOne: {
            filter: { product: pItem, promotion: newPromotion._id },
            update: { $set: { product: pItem, promotion: newPromotion._id } },
            upsert: true,
          },
        })),
      ).catch((err) => err);
      if (data instanceof Error) {
        return badRequest(res, mongooseErrMessageHelper(data));
      }
    }
    return successResponse(res, newPromotion);
  },
];
