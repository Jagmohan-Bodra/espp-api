import { Schema } from 'mongoose';
import { TAG_STATUS } from '~/routes/constants/master-data';
import { getEnum } from '~/routes/utils';
import timestampsPlusgin from './schemaPlugin/timestamps';

export default () => {
  const schema = new Schema(
    {
      name: {
        type: String,
        unique: true,
        required: true,
      },
      description: {
        type: String,
      },
      status: {
        type: String,
        enum: getEnum(TAG_STATUS),
        default: TAG_STATUS.ENABLED,
      },
      seoProps: {
        type: Object,
      },
    },
    {
      timestamps: true,
    },
  );

  schema.plugin(timestampsPlusgin);
  return schema;
};
