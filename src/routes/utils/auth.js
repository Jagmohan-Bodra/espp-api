export const getCustomerHelper = async ({ models, jwt }, req) => {
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  const { id } = await jwt.verify(token);
  return models.Customer.findOne({ user: id });
};

export default getCustomerHelper;
