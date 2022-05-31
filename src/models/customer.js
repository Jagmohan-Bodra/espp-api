import { Schema } from 'mongoose';
import timestampsPlusgin from './schemaPlugin/timestamps';
import { isEmail } from './util';
import errorMessages from '~/routes/constants/error-messages';
import { USER_PUBLIC_KEY } from '~/routes/constants/schema';
import { getEnum } from '~/routes/utils';
import {
  CUSTOMER_ADDRESS_TYPE,
  CUSTOMER_STATUS,
} from '~/routes/constants/master-data';

export default () => {
  const schema = new Schema(
    {
      customerCode: {
        type: String,
        requires: true,
        unique: true,
      },
      remark: {
        type: String,
      },
      designation: {
        type: String,
      },
      contactNo: {
        type: String,
      },
      personalEmail: {
        type: String,
        validate: [isEmail, errorMessages.PERSONAL_EMAIL_INVALID],
      },
      personalContact: {
        type: String,
      },
      salesExecutive: {
        type: String,
      },
      creditTerms: {
        type: String,
      },
      accountType: {
        type: String,
        requires: true,
      },
      currency: {
        type: String,
        requires: true,
      },
      status: {
        type: String,
        enum: getEnum(CUSTOMER_STATUS),
        default: CUSTOMER_STATUS.PENDING,
      },
      addressBlockNo: {
        type: String,
      },
      addressStresstName: {
        type: String,
      },
      addressFloor: {
        type: String,
      },
      addressUnitNo: {
        type: String,
      },
      addressBuildingName: {
        type: String,
      },
      addressPostCode: {
        type: String,
      },
      addressCity: {
        type: String,
      },
      addressState: {
        type: String,
      },
      addressCountry: {
        type: String,
      },
      addressList: [
        {
          level1: { type: String, default: '' },
          level2: { type: String, default: '' },
          level3: { type: String, default: '' },
          level4: { type: String, default: '' },
          level5: { type: String, default: '' },
          level6: { type: String, default: '' },
          level7: { type: String, default: '' },
          level8: { type: String, default: '' },
          level9: { type: String, default: '' },
          level10: { type: String, default: '' },
          level11: { type: String, default: '' },
          level12: { type: String, default: '' },
          level13: { type: String, default: '' },
          level14: { type: String, default: '' },
        },
      ],
      addressListDefault: {
        type: String,
      },
      financeSalutation: {
        type: String,
      },
      financeFirstName: {
        type: String,
      },
      financeLastName: {
        type: String,
      },
      financeContactNo: {
        type: String,
      },
      financeEmail: {
        type: String,
        validate: [isEmail, errorMessages.FINANCE_EMAIL_INVALID],
      },
      companyName: {
        type: String,
      },
      companyRegNo: {
        type: String,
      },
      companyContactNo: {
        type: String,
      },
      companyFax: {
        type: String,
      },
      companyNatureOfBusiness: {
        type: String,
      },
      membership: {
        type: Schema.Types.ObjectId,
        ref: 'memberShip',
      },
      internalNote: {
        type: [Schema.Types.ObjectId],
        ref: 'internal_note',
      },

      promotionCoupon: {
        type: [Schema.Types.ObjectId],
        ref: 'promotion_coupon',
      },

      user: {
        type: Schema.Types.ObjectId,
        ref: 'user',
      },
      orderHistory: {
        type: [Schema.Types.ObjectId],
        ref: 'order',
      },
      addresses: {
        type: [Object],
      },
      addressesDefault: {
        type: Schema.Types.ObjectId,
      },
    },
    {
      timestamps: true,
    },
  );

  function populateFunc(next) {
    this.populate([
      {
        path: 'user',
        model: 'user',
        select: USER_PUBLIC_KEY.join(' '),
      },
      {
        path: 'orderHistory',
        model: 'order',
      },
      {
        path: 'internalNote',
        model: 'internal_note',
      },
      {
        path: 'membership',
        model: 'membership',
      },
      {
        path: 'promotionCoupon',
        model: 'promotion_coupon',
      },
    ]);

    next();
  }

  schema.pre('findOne', populateFunc).pre('findById', populateFunc);

  schema.pre('find', function populate(next) {
    this.populate([
      {
        path: 'user',
        model: 'user',
        select: USER_PUBLIC_KEY.join(' '),
      },
      {
        path: 'membership',
        model: 'membership',
      },
    ]);

    next();
  });

  schema.set('toObject', { virtuals: true });
  schema.set('toJSON', { virtuals: true });
  schema.virtual('fullAddresses').get(function getv() {
    return (this.addressList || []).map((item) =>
      `${item.level9} ${item.level8} ${item.level7} ${item.level6} ${item.level5} ${item.level4} ${item.level3} ${item.level2} ${item.level1}`
        .replace(/\s+/g, ' ')
        .trim(),
    );
  });

  schema.plugin(timestampsPlusgin);

  return schema;
};
