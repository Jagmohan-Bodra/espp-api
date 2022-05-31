import { Schema } from 'mongoose';
import { ENQUIRY_STATUS } from '~/routes/constants/master-data';
import { getEnum } from '~/routes/utils';
import timestampsPlusgin from './schemaPlugin/timestamps';

export default () => {
  const schema = new Schema(
    {
      name: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
      },
      contact: {
        type: String,
        required: true,
      },
      product: {
        type: Schema.Types.ObjectId,
        ref: 'product',
      },
      message: {
        type: String,
        required: true,
      },
      internalNote: {
        type: [Schema.Types.ObjectId],
        ref: 'enquiry_internal_note',
      },
      status: {
        type: String,
        enum: getEnum(ENQUIRY_STATUS),
        default: ENQUIRY_STATUS.OPEN,
      },
      reason: {
        type: String,
      },
    },
    {
      timestamps: true,
    },
  );

  function populateFunc() {
    this.populate('product internalNote');
  }

  schema
    .pre('find', populateFunc)
    .pre('findOne', populateFunc)
    .pre('findById', populateFunc);

  schema.plugin(timestampsPlusgin);
  return schema;
};
