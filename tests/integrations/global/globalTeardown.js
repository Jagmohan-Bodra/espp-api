module.exports = async () => {
  await global.shutdown();
  await global.mongodb.close();
};
