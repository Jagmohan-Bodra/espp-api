import { param } from 'express-validator';
import Models from '~/models';
import ROLES from '~/routes/constants/roles';

import { getObjectId, isValid } from '~/routes/utils';
import { notFound, successResponse } from '~/routes/utils/response';

/**
 * @param {Object} deps
 * @param {Models} deps.models
 */
export default ({ models }, authenticate, validator) => [
  authenticate(ROLES.BRAND_CREATE),
  [param('id').custom(isValid).withMessage('"id" must be a objectId value')],
  validator,
  async (req, res) => {
    const model = await models.Brand.findOneAndRemove({
      _id: getObjectId(req.params.id),
    });
    if (!model) {
      return notFound(res);
    }

    return successResponse(res, model);
  },
];
