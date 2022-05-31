module.exports = function timestamps(schema) {
  const updateTimestemps = function update(next) {
    const self = this;
    if (!self.createdAt) {
      self.createdAt = new Date();
    } else {
      self.updatedAt = new Date();
    }
    next();
  };

  schema
    .pre('save', updateTimestemps)
    .pre('update', updateTimestemps)
    .pre('findOneAndUpdate', updateTimestemps);
};
