import { Schema } from 'mongoose';
import { APPROVAL_STATUS, APPROVAL_TYPE } from '~/routes/constants/master-data';
import { getEnum } from '~/routes/utils';
import timestampsPlusgin from './schemaPlugin/timestamps';

export default () => {
  const schema = new Schema(
    {
      type: {
        type: String,
        enum: Object.values(APPROVAL_TYPE),
      },
      status: {
        type: String,
        enum: getEnum(APPROVAL_STATUS),
        default: APPROVAL_STATUS.PENDING,
      },
      customer: {
        type: Schema.Types.ObjectId,
        ref: 'customer',
      },
      form: {
        type: Object,
      },
      senderBy: {
        type: Schema.Types.ObjectId,
        ref: 'user',
      },
    },
    {
      timestamps: true,
    },
  );

  function populateFunc() {
    this.populate({
      path: 'customer',
    });
  }

  schema
    .pre('find', populateFunc)
    .pre('findOne', populateFunc)
    .pre('findById', populateFunc);

  schema.plugin(timestampsPlusgin);
  return schema;
};
