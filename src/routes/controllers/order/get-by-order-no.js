import { param } from 'express-validator';
import { notFound, successResponse } from '~/routes/utils/response';
import errorMessages from '~/routes/constants/error-messages';
import Models from '~/models';

const payloadSchema = [param('orderNo')];

/**
 * @param {Object} deps
 * @param {Models} deps.models
 */
export default ({ models }, validator) => [
  payloadSchema,
  validator,
  async (req, res) => {
    const data = await models.Order.findOne({
      orderNo: req.params.orderNo,
    })
      .populate('orderProducts')
      .populate('promotion')
      .populate('customer')
      .populate('membership');

    if (!data) {
      return notFound(res, errorMessages.ORDER_NOT_FOUND);
    }

    return successResponse(res, data);
  },
];
