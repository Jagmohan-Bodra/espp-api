import { Schema } from 'mongoose';
import timestampsPlusgin from './schemaPlugin/timestamps';

export default () => {
  const schema = new Schema(
    {
      key: {
        type: String,
        maxLength: 255,
      },
      value: {
        type: String,
      },
      inputType: {
        type: String,
      },
      module: {
        type: String,
      },
      group: {
        type: String,
      },
      label: {
        type: String,
        trim: true,
      },
      hint: {
        type: String,
        trim: true,
      },
      options: {
        type: Array,
      },
    },
    {
      timestamps: true,
    },
  );

  schema.plugin(timestampsPlusgin);
  return schema;
};
