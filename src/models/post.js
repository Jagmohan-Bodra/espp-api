import { Schema } from 'mongoose';
import timestampsPlusgin from './schemaPlugin/timestamps';
import { POST_CATEGOTY_PUBLIC_KEY } from '~/routes/constants/schema';
import { BASE_URL } from '~/config';

export default () => {
  const schema = new Schema(
    {
      site: {
        type: Schema.Types.ObjectId,
        ref: 'site',
      },
      postCategory: [
        {
          type: Schema.Types.ObjectId,
          ref: 'post_category',
        },
      ],
      content: {
        type: String,
      },
      name: {
        type: String,
        trim: true,
        require: true,
      },
      description: {
        type: String,
        trim: true,
      },
      url: {
        type: String,
        unique: true,
      },
      avatar: {
        type: String,
      },
      avatarPath: {
        type: String,
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
    },
    {
      timestamps: true,
    },
  );

  function populateFunc() {
    this.populate({
      path: 'postCategory',
      select: POST_CATEGOTY_PUBLIC_KEY.join(' '),
    });
  }

  schema.set('toObject', { virtuals: true });
  schema.set('toJSON', { virtuals: true });
  schema.virtual('avatarFullPath').get(function getv() {
    return `${BASE_URL}${this.avatarPath}`;
  });
  schema.virtual('seoProp').get(function getv() {
    return {
      ...this.seoProps,
      imageFullPath: `${BASE_URL}${(this.seoProps || {}).images}`,
    };
  });

  schema
    .pre('find', populateFunc)
    .pre('findOne', populateFunc)
    .pre('findById', populateFunc);

  schema.plugin(timestampsPlusgin);
  return schema;
};
