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
        require: true,
      },
      code: {
        type: String,
        require: true,
        unique: true,
      },
      url: {
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
      parent: {
        type: Schema.Types.ObjectId,
        ref: 'product_category',
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

  function populateFunc() {
    this.populate({
      path: 'parent',
    });
  }

  schema
    .pre('find', populateFunc)
    .pre('findOne', populateFunc)
    .pre('findById', populateFunc);

  schema.set('toObject', { virtuals: true });
  schema.set('toJSON', { virtuals: true });
  schema.virtual('imageFullPath').get(function getv() {
    return `${BASE_URL}${this.imagePath}`;
  });
  schema.virtual('seoProp').get(function getv() {
    return {
      ...this.seoProps,
      imageFullPath: `${BASE_URL}${(this.seoProps || {}).images}`,
    };
  });

  schema.plugin(timestampsPlusgin);
  return schema;
};
