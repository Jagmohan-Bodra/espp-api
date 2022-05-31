import { param } from 'express-validator';
import { notFound, successResponse } from '~/routes/utils/response';
import { getObjectId, isValid } from '~/routes/utils';
import Models from '~/models';
import errorMessages from '~/routes/constants/error-messages';
import ROLES from '~/routes/constants/roles';

/**
 * @param {Object} deps
 * @param {Models} deps.models
 */
export default ({ models }, validator) => [
  [param('id').custom(isValid).withMessage('"id" must be a objectId value')],
  validator,
  async (req, res) => {
    const model = await models.Product.findOne({
      _id: getObjectId(req.params.id),
    });

    if (!model) {
      return notFound(res, errorMessages.PRODUCT_NOT_FOUND);
    }

    return successResponse(res, model);
  },
];
