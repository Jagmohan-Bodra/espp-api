export default ({ eventPublishers }) => ({
  publish: async (payload) => eventPublishers.createOrderPublishser(payload),
});
