import { Schema } from 'mongoose';
import { BASE_URL } from '~/config';
import { CATEGORY_STATUS } from '~/routes/constants/master-data';
import { getEnum } from '~/routes/utils';
import timestampsPlusgin from './schemaPlugin/timestamps';

export default () => {
  const schema = new Schema(
    {
      name: {
        type: String,
        unique: true,
        require: true,
      },
      url: {
        type: String,
        unique: true,
      },
      description: {
        type: String,
      },
      parent: {
        type: Schema.Types.ObjectId,
        ref: 'post_category',
      },
      seoProps: {
        type: Object,
      },
      status: {
        type: String,
        enum: getEnum(CATEGORY_STATUS),
        default: CATEGORY_STATUS.ENABLED,
      },
    },
    {
      timestamps: true,
    },
  );

  schema.set('toObject', { virtuals: true });
  schema.set('toJSON', { virtuals: true });
  schema.virtual('seoProp').get(function getv() {
    return {
      ...this.seoProps,
      imageFullPath: `${BASE_URL}${(this.seoProps || {}).images}`,
    };
  });

  schema.plugin(timestampsPlusgin);
  return schema;
};
