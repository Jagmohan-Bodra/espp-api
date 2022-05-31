import { Schema } from 'mongoose';
import timestampsPlusgin from './schemaPlugin/timestamps';

export default () => {
  const schema = new Schema(
    {
      user: {
        type: Schema.Types.ObjectId,
        ref: 'user',
      },
      sendDate: {
        type: String,
      },
      message: {
        type: String,
      },
      pushlish: {
        type: Boolean,
      },
      enquiry: {
        type: Schema.Types.ObjectId,
        ref: 'enquiry',
      },
    },
    {
      timestamps: true,
    },
  );

  function populateFunc() {
    this.populate('user');
  }

  schema
    .pre('find', populateFunc)
    .pre('findOne', populateFunc)
    .pre('findById', populateFunc);

  schema.plugin(timestampsPlusgin);
  return schema;
};
