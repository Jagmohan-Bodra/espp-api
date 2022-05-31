import { Schema } from 'mongoose';
import { BASE_URL } from '~/config';
import { PRODUCT_STATUS } from '~/routes/constants/master-data';
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
      barcode: {
        type: String,
        unique: true,
        require: true,
        validate: {
          validator: function isNumber(v) {
            return !isNaN(v);
          },
          message: (props) => `${props.value} is not a valid number!`,
        },
      },
      quantity: {
        type: Number,
        default: 0,
      },
      view: {
        type: Number,
        default: 0,
      },
      sold: {
        type: Number,
        default: 0,
      },
      moq: {
        type: Number,
      },
      sku: {
        type: String,
      },
      description: {
        type: String,
      },
      unit: {
        type: String,
      },
      size: {
        type: String,
      },
      typeAndMaterial: {
        type: String,
      },
      uom: {
        type: String,
      },
      itemPackingSize: {
        type: String,
      },
      qtyPerCtn: {
        type: String,
      },
      images: {
        type: [String],
      },
      imagePaths: {
        type: [String],
      },
      taxApply: {
        type: String,
      },
      status: {
        type: String,
        enum: getEnum(PRODUCT_STATUS),
        default: PRODUCT_STATUS.ENABLED,
      },
      content: {
        type: String,
      },
      styles: {
        type: Object,
      },
      published: {
        type: Boolean,
      },
      productCategories: [
        {
          type: Schema.Types.ObjectId,
          ref: 'product_category',
        },
      ],
      brands: [
        {
          type: Schema.Types.ObjectId,
          ref: 'brand',
        },
      ],
      colors: [
        {
          type: Schema.Types.ObjectId,
          ref: 'color',
        },
      ],
      tags: [
        {
          type: Schema.Types.ObjectId,
          ref: 'tag',
        },
      ],
      publicPrice: {
        type: Number,
      },
      seoProps: {
        type: Object,
      },
      inventoryThreshold: {
        type: Number,
        default: 0,
      },
    },
    {
      timestamps: true,
    },
  );

  function populateFunc() {
    this.populate('productCategories brands colors tags');
  }

  schema
    .pre('find', populateFunc)
    .pre('findOne', populateFunc)
    .pre('findById', populateFunc);

  schema.set('toObject', { virtuals: true });
  schema.set('toJSON', { virtuals: true });
  schema.virtual('imageFullPaths').get(function getv() {
    return (this.imagePaths || []).map((item) => `${BASE_URL}${item}`);
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
