import errorMessages from '~/routes/constants/error-messages';

export default (order) => {
  if (!order) {
    return { errors: errorMessages.ORDER_NOT_FOUND };
  }

  const { customer } = order;
  if (!customer) {
    return { errors: errorMessages.CUSTOMER_NOT_FOUND };
  }

  const { user } = customer;
  if (!user) {
    return { errors: errorMessages.USER_NOT_FOUND };
  }

  const { email } = user;
  if (!email) {
    return { errors: errorMessages.CUSTOMER_EMAIL_NOT_FOUND };
  }

  return {};
};
