import { Schema } from 'mongoose';
import { BASE_URL } from '~/config';
import { PAGE_TYPE } from '~/routes/constants/master-data';
import { getEnum } from '~/routes/utils';
import timestampsPlusgin from './schemaPlugin/timestamps';

export default () => {
  const schema = new Schema(
    {
      site: {
        type: Schema.Types.ObjectId,
        ref: 'site',
      },
      theme: {
        type: Schema.Types.ObjectId,
        ref: 'theme',
      },
      name: {
        type: String,
        require: true,
      },
      type: {
        type: String,
        enum: getEnum(PAGE_TYPE),
        default: PAGE_TYPE.CONTENT,
      },
      description: {
        type: String,
      },
      url: {
        type: String,
        unique: true,
      },
      pushlish: {
        type: Boolean,
      },
      seoProps: {
        type: Object,
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
    this.populate({
      path: 'theme',
      select: '_id name pushlish',
    });
  }
  function populateFuncFull() {
    this.populate([
      {
        path: 'theme',
        populate: {
          path: 'variants',
        },
      },
      {
        path: 'variants',
        options: { sort: { order: -1 } },
      },
    ]);
  }

  schema.set('toObject', { virtuals: true });
  schema.set('toJSON', { virtuals: true });
  schema.virtual('seoProp').get(function getv() {
    return {
      ...this.seoProps,
      imageFullPath: `${BASE_URL}${(this.seoProps || {}).images}`,
    };
  });

  schema
    .pre('find', populateFunc)
    .pre('findOne', populateFuncFull)
    .pre('findById', populateFuncFull);

  schema.plugin(timestampsPlusgin);
  return schema;
};
