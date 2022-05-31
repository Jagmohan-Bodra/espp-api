export default ({ eventPublishers }) => ({
  publish: async (payload) => eventPublishers.updateOrderPublishser(payload),
});
