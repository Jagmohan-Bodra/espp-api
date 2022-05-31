import { param } from 'express-validator';
import Models from '~/models';
import ROLES from '~/routes/constants/roles';

import { getObjectId, isValid } from '~/routes/utils';
import { setCacheProductCategories } from '~/routes/utils/model-cache';
import { notFound, successResponse } from '~/routes/utils/response';

/**
 * @param {Object} deps
 * @param {Models} deps.models
 */
export default ({ cache, models }, authenticate, validator) => [
  authenticate(ROLES.PRODUCT_CATEGORY_DELETE),
  [param('id').custom(isValid).withMessage('"id" must be a objectId value')],
  validator,
  async (req, res) => {
    const model = await models.ProductCategory.findOneAndRemove({
      _id: getObjectId(req.params.id),
    });
    if (!model) {
      return notFound(res);
    }
    await setCacheProductCategories({ cache, models });
    return successResponse(res, model);
  },
];
