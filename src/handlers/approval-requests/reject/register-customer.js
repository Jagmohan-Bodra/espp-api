import { APPROVAL_STATUS } from '~/routes/constants/master-data';

export default ({ models }) => ({
  async run({ approval }) {
    const { customer } = approval;
    if (customer) {
      const { user } = customer;
      await models.User.deleteOne({ _id: user });
      user.deleteOne();
      await customer.deleteOne();
    }

    await approval.set({ status: APPROVAL_STATUS.REJECTED }).save();

    return { approval, customer };
  },
});
