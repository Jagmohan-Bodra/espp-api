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
      customer: {
        type: Schema.Types.ObjectId,
        ref: 'customer',
      },
    },
    {
      timestamps: true,
    },
  );

  function populateFunc() {
    this.populate([
      {
        path: 'user',
        model: 'user',
        select: '-userGroup -validTokens',
      },
    ]);
  }

  schema
    .pre('find', populateFunc)
    .pre('findOne', populateFunc)
    .pre('findById', populateFunc);

  schema.plugin(timestampsPlusgin);
  return schema;
};
