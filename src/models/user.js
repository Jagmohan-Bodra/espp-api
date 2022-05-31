import mongoose, { Schema } from 'mongoose';
import { BASE_URL } from '~/config';
import {
  GENDER,
  SALUTATION,
  USER_STATUS,
} from '~/routes/constants/master-data';
import { USERGROUP_PUBLIC_KEY } from '~/routes/constants/schema';
import { getEnum } from '~/routes/utils';
import timestampsPlusgin from './schemaPlugin/timestamps';

export default () => {
  const userSchema = new mongoose.Schema(
    {
      userGroup: {
        type: Schema.Types.ObjectId,
        ref: 'user_group',
      },
      lastLogin: {
        type: String,
      },
      name: {
        type: String,
        min: 1,
        max: 255,
      },
      userCode: {
        type: String,
      },
      salutation: {
        type: String,
        enum: getEnum(SALUTATION),
      },
      avatar: {
        type: String,
      },
      avatarPath: {
        type: String,
      },
      firstName: {
        type: String,
        max: 255,
      },
      lastName: {
        type: String,
        max: 255,
      },
      birthday: {
        type: String,
      },
      address: {
        type: String,
      },
      gender: {
        type: String,
        enum: getEnum(GENDER),
      },
      email: {
        type: String,
        min: 4,
        max: 255,
        lowercase: true,
        unique: true,
      },
      phone: {
        type: String,
        min: 8,
        max: 20,
      },
      password: {
        type: String,
        min: 1,
        max: 255,
      },
      validTokens: {
        type: Array,
        default: [],
      },
      active: {
        type: Boolean,
        default: true,
      },
      status: {
        type: String,
        enum: getEnum(USER_STATUS),
        default: USER_STATUS.ENABLED,
      },
    },
    {
      timestamps: true,
    },
  );

  function populateFunc() {
    this.populate({
      path: 'userGroup',
      select: USERGROUP_PUBLIC_KEY.join(' '),
    });
  }

  function populateFindFunc() {
    this.populate({
      path: 'userGroup',
      select: '_id active name description updatedAt createdAt',
    });
  }

  userSchema.pre('findOne', populateFunc).pre('findById', populateFunc);
  userSchema.pre('find', populateFindFunc);

  userSchema.set('toObject', { virtuals: true });
  userSchema.set('toJSON', { virtuals: true });
  userSchema.virtual('avatarFullPath').get(function getv() {
    return `${BASE_URL}${this.avatarPath}`;
  });

  userSchema.plugin(timestampsPlusgin);
  return userSchema;
};
