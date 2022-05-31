import { Schema } from 'mongoose';
import { BASE_URL } from '~/config';
import { BRAND_STATUS } from '~/routes/constants/master-data';
import { getEnum } from '~/routes/utils';
import timestampsPlusgin from './schemaPlugin/timestamps';

export default () => {
  const schema = new Schema(
    {
      name: {
        type: String,
        require: true,
      },
      url: {
        type: String,
        unique: true,
      },
      code: {
        type: String,
        unique: true,
      },
      image: {
        type: String,
      },
      imagePath: {
        type: String,
      },
      description: {
        type: String,
      },
      status: {
        type: String,
        enum: getEnum(BRAND_STATUS),
        default: BRAND_STATUS.ENABLED,
      },
      seoProps: {
        type: Object,
      },
    },
    {
      timestamps: true,
    },
  );

  schema.set('toObject', { virtuals: true });
  schema.set('toJSON', { virtuals: true });
  schema.virtual('imageFullPath').get(function getv() {
    return `${BASE_URL}${this.imagePath}`;
  });

  schema.plugin(timestampsPlusgin);
  return schema;
};
