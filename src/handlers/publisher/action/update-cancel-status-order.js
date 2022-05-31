export default ({ eventPublishers }) => ({
  publish: async (payload) =>
    eventPublishers.updateCancelOrderPublishser(payload),
});
