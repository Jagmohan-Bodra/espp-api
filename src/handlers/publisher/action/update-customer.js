export default ({ eventPublishers }) => ({
  publish: async (payload) => eventPublishers.updateCustomerPublishser(payload),
});
