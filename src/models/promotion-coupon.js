import { Schema } from 'mongoose';
import timestampsPlusgin from './schemaPlugin/timestamps';

export default () => {
  const schema = new Schema(
    {
      couponId: {
        type: String,
      },
      customer: {
        type: Schema.Types.ObjectId,
        ref: 'customer',
      },
      name: {
        type: String,
      },
      code: {
        type: String,
      },
      limit: {
        type: Number,
      },
      type: {
        type: String,
      },
      value: {
        type: String,
      },
      offFor: {
        type: String,
      },
      startDate: {
        type: String,
      },
      endDate: {
        type: String,
      },
      status: {
        type: String,
      },
    },
    {
      timestamps: true,
    },
  );

  schema.plugin(timestampsPlusgin);
  return schema;
};
