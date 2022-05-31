import { param } from 'express-validator';
import { isObjectId } from '~/routes/utils/validator';
import { notFound, successResponse } from '~/routes/utils/response';
import Models from '~/models';
import ROLES from '~/routes/constants/roles';

const payloadSchema = [
  param('id').custom(isObjectId).withMessage('"id" must be a objectId value'),
];

/**
 * @param {Object} deps
 * @param {Models} deps.models
 */
export default ({ models }, validator) => [
  payloadSchema,
  validator,
  async (req, res) => {
    const data = await models.Page.findOne({ _id: req.params.id });

    if (!data) {
      return notFound(res);
    }

    return successResponse(res, data);
  },
];
