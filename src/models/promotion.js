import { Schema } from 'mongoose';
import {
  PROMOTIONS_TYPE,
  PROMOTION_APPLYFOR,
  PROMOTIONS_STATUS,
} from '~/routes/constants/master-data';
import { getEnum } from '~/routes/utils';
import timestampsPlusgin from './schemaPlugin/timestamps';

export default () => {
  const schema = new Schema(
    {
      type: {
        type: String,
        enum: getEnum(PROMOTIONS_TYPE),
        required: true,
      },
      percentageValue: {
        type: Number,
        min: 0,
        max: 100,
        required: function func() {
          return this.type === 'PERCENTAGE';
        },
      },
      cashRebateValue: {
        type: Number,
        min: 0,
        required: function func() {
          return this.type === 'CASH_REBATE';
        },
      },
      isFullShippingFee: {
        type: Boolean,
        default: false,
        required: function func() {
          return this.type === 'FREE_SHIPPING';
        },
      },
      freeShippingMaximum: {
        type: Number,
        required: function func() {
          return this.type === 'FREE_SHIPPING' && !this.isFullShippingFee;
        },
      },
      name: {
        type: String,
      },
      status: {
        type: String,
        enum: getEnum(PROMOTIONS_STATUS),
        default: PROMOTIONS_STATUS.ENABLED,
      },
      startDate: {
        type: Date,
      },
      endDate: {
        type: Date,
      },
      applyFor: {
        type: String,
        enum: getEnum(PROMOTION_APPLYFOR),
        default: PROMOTION_APPLYFOR.ALL_PRODUCTS,
      },
      capacity: {
        type: Number,
      },
      content: {
        type: String,
      },
      published: {
        type: Boolean,
      },
    },
    {
      timestamps: true,
    },
  );

  schema.plugin(timestampsPlusgin);
  return schema;
};
