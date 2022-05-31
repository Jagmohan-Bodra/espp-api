import { Schema } from 'mongoose';
import timestampsPlusgin from './schemaPlugin/timestamps';

export default () => {
  const schema = new Schema(
    {
      name: {
        type: String,
        unique: true,
      },
      description: {
        type: String,
      },
      discountPercent: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
      },
      isDefault: {
        type: Boolean,
        default: false,
      },
    },
    {
      timestamps: true,
    },
  );

  schema.plugin(timestampsPlusgin);
  return schema;
};
