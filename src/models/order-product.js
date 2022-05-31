import { Schema } from 'mongoose';
import timestampsPlusgin from './schemaPlugin/timestamps';

export default () => {
  const schema = new Schema(
    {
      product: {
        type: Schema.Types.ObjectId,
        ref: 'product',
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
      total: {
        type: Number,
      },
      membershipDiscount: {
        type: Number,
      },
      subTotal: {
        type: Number,
      },
      price: {
        type: Number,
      },
    },
    {
      timestamps: true,
    },
  );

  function populateFunc() {
    this.populate({
      path: 'product',
    });
  }

  schema
    .pre('find', populateFunc)
    .pre('findOne', populateFunc)
    .pre('findById', populateFunc);

  schema.plugin(timestampsPlusgin);
  return schema;
};
