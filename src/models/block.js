import { Schema } from 'mongoose';
import { BLOCK_STATUS, BLOCK_TYPE } from '~/routes/constants/master-data';
import { getEnum } from '~/routes/utils';
import timestampsPlusgin from './schemaPlugin/timestamps';

export default () => {
  const schema = new Schema(
    {
      name: {
        type: String,
        unique: true,
      },
      type: {
        type: String,
        enum: getEnum(BLOCK_TYPE),
        default: BLOCK_TYPE.CUSTOMIZE,
      },
      description: {
        type: String,
      },
      position: {
        type: Number,
      },
      avatar: {
        type: String,
      },
      groupCode: {
        type: String,
      },
      styles: {
        type: Object,
      },
      content: {
        type: String,
      },
      status: {
        type: String,
        enum: getEnum(BLOCK_STATUS),
        default: BLOCK_STATUS.ENABLED,
      },
    },
    {
      timestamps: true,
    },
  );
  schema.plugin(timestampsPlusgin);
  return schema;
};
