import { Schema } from 'mongoose';
import { ORDERS_STATUS } from '~/routes/constants/master-data';
import { getEnum } from '~/routes/utils';
import timestampsPlusgin from './schemaPlugin/timestamps';

export default () => {
  const schema = new Schema(
    {
      customer: {
        type: Schema.Types.ObjectId,
        ref: 'customer',
      },
      orderProducts: {
        type: [Schema.Types.ObjectId],
        ref: 'order_product',
      },
      orderNo: {
        type: String,
      },
      purchaseOrder: {
        type: String,
      },
      notes: {
        type: String,
      },
      orderDateTime: {
        type: Date,
      },
      total: {
        type: Number,
      },
      shippingAddress: {
        type: Object,
      },
      billingAddress: {
        type: Object,
      },
      status: {
        type: String,
        enum: getEnum(ORDERS_STATUS),
        default: ORDERS_STATUS.PENDING,
      },
      totalWeight: {
        type: Number,
      },
      tax: {
        type: Number,
      },
      shippingFee: {
        type: Number,
      },
      HandlingFee: {
        type: Number,
      },
      subTotal: {
        type: Number,
      },
      membershipDiscount: {
        type: Number,
      },
      gstPayable: {
        type: Number,
        default: 0,
      },
      grandTotal: {
        type: Number,
        default: function func() {
          if (this.subTotal === undefined || this.gstPayable === undefined) {
            return 0;
          }
          return this.subTotal + this.gstPayable;
        },
      },
      payment: {
        type: String,
      },
      paymentStatus: {
        type: String,
      },
      gstNumber: {
        type: String,
      },
      membership: {
        type: [Schema.Types.ObjectId],
        ref: 'membership',
      },
      quantity: {
        type: Number,
      },
      added: {
        type: Boolean,
        default: false,
      },
      active: {
        type: Boolean,
        default: true,
      },
    },
    {
      timestamps: true,
    },
  );

  function populateFunc() {
    this.populate('orderProducts customer membership');
  }

  schema
    .pre('find', populateFunc)
    .pre('findOne', populateFunc)
    .pre('findById', populateFunc);

  schema.plugin(timestampsPlusgin);
  return schema;
};
