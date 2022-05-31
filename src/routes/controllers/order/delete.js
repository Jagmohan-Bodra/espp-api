import { param } from 'express-validator';
import { notFound, successResponse } from '~/routes/utils/response';
import { isObjectId } from '~/routes/utils/validator';
import errorMessages from '~/routes/constants/error-messages';
import Models from '~/models';
import ROLES from '~/routes/constants/roles';

/**
 * @param {Object} deps
 * @param {Models} deps.models
 */
export default ({ models }, authenticate, validator) => [
  authenticate(ROLES.ORDER_DELETE),
  [param('orderId').custom(isObjectId).withMessage(errorMessages.ID_INVALID)],
  validator,
  async (req, res) => {
    const data = await models.Order.findById(req.params.orderId).exec();

    if (!data) {
      return notFound(res, errorMessages.DATA_NOT_FOUND);
    }

    data.deleteOne();

    return successResponse(res, data);
  },
];
