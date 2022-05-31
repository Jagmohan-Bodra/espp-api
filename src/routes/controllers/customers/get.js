import { param } from 'express-validator';
import { isObjectId } from '~/routes/utils/validator';

import { notFound, successResponse } from '~/routes/utils/response';
import errorMessages from '~/routes/constants/error-messages';
import Models from '~/models';
import ROLES from '~/routes/constants/roles';

const payloadSchema = [
  param('customerId')
    .custom(isObjectId)
    .withMessage(errorMessages.CUSTOMER_ID_INVALID),
];

/**
 * @param {Object} deps
 * @param {Models} deps.models
 */
export default ({ models }, authenticate, validator) => [
  authenticate(ROLES.CUSTOMER_GET),
  payloadSchema,
  validator,
  async (req, res) => {
    const data = await models.Customer.findOne({ _id: req.params.customerId });

    if (!data) {
      return notFound(res, errorMessages.CUSTOMER_NOT_FOUND);
    }
    return successResponse(res, data);
  },
];
