import { param } from 'express-validator';
import { isObjectId } from '~/routes/utils/validator';
import { notFound, successResponse } from '~/routes/utils/response';
import errorMessages from '~/routes/constants/error-messages';
import Models from '~/models';
import ROLES from '~/routes/constants/roles';

const payloadSchema = [
  param('orderId').custom(isObjectId).withMessage(errorMessages.ID_INVALID),
];

/**
 * @param {Object} deps
 * @param {Models} deps.models
 */
export default ({ models }, authenticate, validator) => [
  authenticate(ROLES.ORDER_GET),
  payloadSchema,
  validator,
  async (req, res) => {
    const data = await models.Order.findOne({
      _id: req.params.orderId,
    })
      .populate('orderProducts')
      .populate('promotion')
      .populate('customer')
      .populate('membership');

    if (!data) {
      return notFound(res, errorMessages.DATA_NOT_FOUND);
    }

    return successResponse(res, data);
  },
];
