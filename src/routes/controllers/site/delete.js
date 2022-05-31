import { param } from 'express-validator';
import Models from '~/models';
import { notFound, successResponse } from '~/routes/utils/response';
import { isObjectId } from '~/routes/utils/validator';

const rules = [
  param('id').custom(isObjectId).withMessage('"id" must be a objectId value'),
];

/**
 * @param {Object} deps
 * @param {Models} deps.models
 */
export default ({ models }, validator) => [
  rules,
  validator,
  async (req, res) => {
    const data = await models.Site.findById(req.params.id).exec();

    if (!data) {
      return notFound(res);
    }

    data.deleteOne();

    return successResponse(res, data);
  },
];
