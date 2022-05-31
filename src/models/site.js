import { Schema } from 'mongoose';
import timestampsPlusgin from './schemaPlugin/timestamps';

export default () => {
  const schema = new Schema(
    {
      key: {
        type: String,
        maxLength: 255,
      },
      name: {
        type: String,
        trim: true,
      },
      avatar: {
        type: String,
      },
      seoPropDefault: {
        type: Object,
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
