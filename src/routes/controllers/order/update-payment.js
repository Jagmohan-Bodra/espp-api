import { param } from 'express-validator';
import _ from 'lodash';
import { badRequest, notFound, successResponse } from '../../utils/response';
import { isObjectId } from '~/routes/utils/validator';
import errorMessages from '~/routes/constants/error-messages';
import Models from '~/models';
import {
  APPROVAL_TYPE,
  PAYMENT_OPTION,
  PAYMENT_STATUS,
} from '~/routes/constants/master-data';
import NotificationHandler from '~/handlers/notification';
import { insertOneApproval } from '~/routes/controllers/approval/create-approval';
import { getCacheSettings } from '~/routes/utils/setting-cache';

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
export default ({ models, cache, config, notificationHandler }, validator) => [
  updateSchema,
  validator,
  async (req, res) => {
    const { payment } = _.pick(req.body, ['payment']);
    let paymentStatus = PAYMENT_STATUS.UNPAID;
    const order = await models.Order.findById(req.params.orderId);
    if (!order) {
      return notFound(res, errorMessages.DATA_NOT_FOUND);
    }

    if (
      [
        PAYMENT_OPTION.LOCAL_BANK_TRANSFER,
        PAYMENT_OPTION.PAYNOW,
        PAYMENT_OPTION.PAYPAL,
      ].findIndex((item) => item == payment) > -1
    ) {
      paymentStatus = PAYMENT_STATUS.PROCESSING;
      // send email
      const { approveLink, rejectLink } = await insertOneApproval(
        { models, config },
        {
          type: APPROVAL_TYPE.PAYMENT,
          form: { orderId: order._id },
        },
      );
      const {
        PAYMENT_LOCAL_BANK_TRANSFER,
        PAYMENT_PAYPAL,
        PAYMENT_PAYNOW,
      } = NotificationHandler.type;
      let type;
      if (PAYMENT_OPTION.LOCAL_BANK_TRANSFER == payment) {
        type = PAYMENT_LOCAL_BANK_TRANSFER;
      }
      if (PAYMENT_OPTION.PAYNOW == payment) {
        type = PAYMENT_PAYNOW;
      }
      if (PAYMENT_OPTION.PAYPAL == payment) {
        type = PAYMENT_PAYPAL;
      }
      const settings = await getCacheSettings({ cache, models });
      await notificationHandler.publish(type, {
        approveLink,
        rejectLink,
        data: {
          ...order.toJSON(),
          payment,
          paymentStatus,
        },
        settings,
      });
    }

    order.set({ payment, paymentStatus });
    const errors = order.validateSync();
    if (errors) {
      return badRequest(res, errors.message);
    }
    await order.save();

    return successResponse(res, order);
  },
];
