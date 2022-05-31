import { Schema } from 'mongoose';
import { BASE_URL } from '~/config';
import { VARIANT_TYPE } from '~/routes/constants/master-data';
import timestampsPlusgin from './schemaPlugin/timestamps';

export default () => {
  const schema = new Schema(
    {
      group: {
        type: String,
      },
      type: {
        type: String,
      },
      label: {
        type: String,
      },
      key: {
        type: String,
      },
      value: {
        type: Object,
      },
      description: {
        type: String,
      },
      order: {
        type: Number,
      },
    },
    {
      timestamps: true,
    },
  );

  schema.set('toObject', { virtuals: true });
  schema.set('toJSON', { virtuals: true });
  schema.virtual('values').get(function getv() {
    if (this.type == VARIANT_TYPE.GALLERY) {
      return (this.value || []).map((item) => ({
        ...item,
        imageFullPath: `${BASE_URL}${item.imagePath}`,
      }));
    }

    if (this.type == VARIANT_TYPE.PHOTO) {
      return `${BASE_URL}${this.value}`;
    }

    return this.value;
    // return `${BASE_URL}${this.imagePath}`;
  });

  schema.plugin(timestampsPlusgin);
  return schema;
};
