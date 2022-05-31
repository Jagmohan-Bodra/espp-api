import { param } from 'express-validator';
import Models from '~/models';
import ROLES from '~/routes/constants/roles';

import { notFound, successResponse } from '~/routes/utils/response';
import { isObjectId } from '~/routes/utils/validator';

const rules = [
  param('id').custom(isObjectId).withMessage('"id" must be a objectId value'),
];

/**
 * @param {Object} deps
 * @param {Models} deps.models
 */
export default ({ models }, authenticate, validator) => [
  authenticate(ROLES.THEME_DELETE),
  rules,
  validator,
  async (req, res) => {
    const data = await models.Theme.findById(req.params.id).exec();

    if (!data) {
      return notFound(res);
    }
    data.deleteOne();

    return successResponse(res, data);
  },
];
