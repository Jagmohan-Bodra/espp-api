import NotificationHandler from '~/handlers/notification';
import Models from '~/models';
import errorMessages from '~/routes/constants/error-messages';
import {
  APPROVAL_STATUS,
  PAYMENT_STATUS,
} from '~/routes/constants/master-data';
import { getCacheSettings } from '~/routes/utils/setting-cache';

/**
 * @param {Object} deps
 * @param {Models} deps.models
 */
export default ({ models, cache, notificationHandler }) => ({
  async run({ approval }) {
    const { orderId } = approval.form || {};

    const orderModal = await models.Order.findById(orderId).exec();
    if (!orderModal) {
      await approval.set({ status: APPROVAL_STATUS.REJECTED }).save();
      return {
        errors: { code: 400, message: errorMessages.ORDER_NOT_FOUND },
      };
    }
    await orderModal.set({ paymentStatus: PAYMENT_STATUS.UNPAID }).save();
    await approval.set({ status: APPROVAL_STATUS.REJECTED }).save();

    // send email
    const settings = await getCacheSettings({ cache, models });
    const { ORDER_SORRY } = NotificationHandler.type;
    await notificationHandler.publish(ORDER_SORRY, {
      sendTo: ((orderModal.customer || {}).user || {}).email || '',
      data: orderModal.customer,
      settings,
    });

    return approval;
  },
});
