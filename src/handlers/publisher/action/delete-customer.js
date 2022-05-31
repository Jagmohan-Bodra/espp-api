export default ({ eventPublishers }) => ({
  publish: async (payload) => eventPublishers.deleteCustomerPublishser(payload),
});
