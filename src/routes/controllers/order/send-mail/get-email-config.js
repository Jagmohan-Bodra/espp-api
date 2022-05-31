export default (order, config, type) => {
  const { email } = order.customer.user;
  const orderNo = order.orderNo || order._id.toHexString();
  const title = config.EMAIL_TITLE[type] + orderNo;

  return { email, title };
};
