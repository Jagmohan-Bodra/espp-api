import { Schema } from 'mongoose';
import errorMessages from '~/routes/constants/error-messages';
import timestampsPlusgin from './schemaPlugin/timestamps';
import { isEmail } from './util';

export default () => {
  const schema = new Schema(
    {
      name: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        validate: [isEmail, errorMessages.PERSONAL_EMAIL_INVALID],
      },
      contactNo: {
        type: String,
      },
      message: {
        type: String,
      },
      isRead: {
        type: Boolean,
        default: false,
      },
      readBy: {
        type: Schema.Types.ObjectId,
        ref: 'user',
      },
      readAt: {
        type: Date,
      },
    },
    {
      timestamps: true,
    },
  );

  schema.plugin(timestampsPlusgin);
  return schema;
};
