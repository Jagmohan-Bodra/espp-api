import NotificationHandler from '~/handlers/notification';
import errorMessages from '~/routes/constants/error-messages';
import {
  APPROVAL_STATUS,
  CUSTOMER_STATUS,
} from '~/routes/constants/master-data';
import { isObjectId } from '~/routes/utils/validator';

export default ({ models, notificationHandler }) => ({
  async run({ approval, bodyRequest }) {
    const { membershipId } = bodyRequest;

    if (!isObjectId(membershipId)) {
      await approval.set({ status: APPROVAL_STATUS.APPROVE_FAILED });
      return {
        errors: { code: 400, message: errorMessages.MEMBERSHIP_ID_INVALID },
      };
    }

    const membership = await models.Membership.findById(membershipId).exec();
    if (!membership) {
      await approval.set({ status: APPROVAL_STATUS.APPROVE_FAILED });
      return {
        errors: { code: 400, message: errorMessages.MEMBERSHIP_NOT_FOUND },
      };
    }

    const { customer, form } = approval;
    if (!customer) {
      await approval.set({ status: APPROVAL_STATUS.APPROVE_FAILED });
      return {
        errors: { code: 400, message: errorMessages.CUSTOMER_NOT_FOUND },
      };
    }
    const user = await models.User.findById(
      ((customer || {}).user || {})._id,
    ).exec();
    if (!user) {
      await approval.set({ status: APPROVAL_STATUS.APPROVE_FAILED });
      return {
        errors: { code: 400, message: errorMessages.USER_NOT_FOUND },
      };
    }

    await customer
      .set({ status: CUSTOMER_STATUS.ACTIVE, membership: membership._id })
      .save();
    await user.set({ active: true }).save();
    await approval.set({ status: APPROVAL_STATUS.APPROVED }).save();

    // send email
    const { CREATE_USER } = NotificationHandler.type;
    await notificationHandler.publish(CREATE_USER, {
      name: user.name,
      sender: user.email,
      password: form.password,
    });

    return { approval, customer };
  },
});
