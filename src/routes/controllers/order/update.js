import { param } from 'express-validator';
import _ from 'lodash';
import { badRequest, notFound, successResponse } from '../../utils/response';
import { isObjectId } from '~/routes/utils/validator';
import errorMessages from '~/routes/constants/error-messages';
import Models from '~/models';
import ROLES from '~/routes/constants/roles';
import { ORDERS_STATUS } from '~/routes/constants/master-data';
import { UPDATE_STATUS_ORDER_PUBLISHER } from '~/handlers/publisher/type';

const updateSchema = [
  param('orderId')
    .optional()
    .custom(isObjectId)
    .withMessage(errorMessages.ID_INVALID),
];

/**
 * @param {Object} deps
 * @param {Models} deps.models
 */
export default ({ models, publisherHandle }, authenticate, validator) => [
  authenticate(ROLES.ORDER_UPDATE),
  updateSchema,
  validator,
  async (req, res) => {
    const params = _.pick(req.body, ['status', 'active']);
    const order = await models.Order.findById(req.params.orderId);

    if (!order) {
      return notFound(res, errorMessages.DATA_NOT_FOUND);
    }
    order.set(params);

    if (
      params.status &&
      params.status == ORDERS_STATUS.CANCELLED &&
      !order.added
    ) {
      await models.Product.bulkWrite(
        order.orderProducts.map((item) => ({
          updateOne: {
            filter: { _id: item.product._id },
            update: {
              $set: { quantity: item.product.quantity + item.quantity },
            },
          },
        })),
      );
      order.set({
        added: true,
      });
    }

    const errors = order.validateSync();
    if (errors) {
      return badRequest(res, errors.message);
    }

    await order.save();

    // publisher
    await publisherHandle.publish(UPDATE_STATUS_ORDER_PUBLISHER, order);

    return successResponse(res, order);
  },
];
