import { Schema } from 'mongoose';
import timestampsPlusgin from './schemaPlugin/timestamps';

export default () => {
  const schema = new Schema(
    {
      name: {
        type: String,
      },
      description: {
        type: String,
      },
      pushlish: {
        type: Boolean,
        default: true,
      },
      styles: {
        type: Object,
      },
      content: {
        type: String,
      },
      variants: [
        {
          type: Schema.Types.ObjectId,
          ref: 'variant',
        },
      ],
    },
    {
      timestamps: true,
    },
  );

  function populateFunc() {
    this.populate('variants');
  }

  schema.pre('findOne', populateFunc).pre('findById', populateFunc);

  schema.plugin(timestampsPlusgin);
  return schema;
};
