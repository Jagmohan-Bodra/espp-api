export default ({ eventPublishers }) => ({
  publish: async (payload) => eventPublishers.createCustomerPublishser(payload),
});
