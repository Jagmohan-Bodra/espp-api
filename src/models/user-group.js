import { Schema } from 'mongoose';
import timestampsPlusgin from './schemaPlugin/timestamps';

export default () => {
  const schema = new Schema(
    {
      name: {
        type: String,
        minLength: 1,
        maxLength: 255,
        trim: true,
        unique: true,
      },
      description: {
        type: String,
        maxLength: 255,
      },
      active: {
        type: Boolean,
        default: true,
      },
      roles: {
        type: [String],
      },
    },
    {
      timestamps: true,
    },
  );

  schema.plugin(timestampsPlusgin);
  return schema;
};
