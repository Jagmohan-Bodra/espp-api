import { param } from 'express-validator';
import Models from '~/models';
import errorMessages from '~/routes/constants/error-messages';
import ROLES from '~/routes/constants/roles';

import { getObjectId } from '~/routes/utils';
import { notFound, successResponse } from '~/routes/utils/response';
import { isObjectId } from '~/routes/utils/validator';

const rules = [
  param('promotionId')
    .custom(isObjectId)
    .withMessage(errorMessages.PROMOTION_ID_INVALID),
];

/**
 * @param {Object} deps
 * @param {Models} deps.models
 */
export default ({ models }, authenticate, validator) => [
  authenticate(ROLES.PROMOTION_DELETE),
  rules,
  validator,
  async (req, res) => {
    const { promotionId } = req.params;

    const promotion = await models.Promotion.findById(promotionId).exec();
    if (!promotion) {
      return notFound(res, errorMessages.PROMOTION_NOT_FOUND);
    }

    await promotion.deleteOne();

    return successResponse(res, promotion);
  },
];
