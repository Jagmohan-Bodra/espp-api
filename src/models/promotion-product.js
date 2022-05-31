import { Schema } from 'mongoose';
import timestampsPlusgin from './schemaPlugin/timestamps';

export default () => {
  const schema = new Schema(
    {
      product: {
        type: Schema.Types.ObjectId,
        ref: 'product',
      },
      promotion: {
        type: Schema.Types.ObjectId,
        ref: 'promotion',
      },
    },
    {
      timestamps: true,
    },
  );

  schema.plugin(timestampsPlusgin);
  return schema;
};
