import { Schema } from 'mongoose';

export default () => {
  const schema = new Schema({
    membership: {
      type: Schema.Types.ObjectId,
      ref: 'membership',
    },
    product: {
      type: Schema.Types.ObjectId,
      ref: 'product',
    },
    price: {
      type: Number,
    },
    moq: {
      type: Number,
      default: 0,
    },
  });

  return schema;
};
