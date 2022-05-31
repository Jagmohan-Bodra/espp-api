import { Schema } from 'mongoose';
import timestampsPlusgin from './schemaPlugin/timestamps';

export default () => {
  const schema = new Schema(
    {
      type: {
        type: String,
      },
      name: {
        type: String,
      },
      link: {
        type: String,
      },
      updatedBy: {
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
