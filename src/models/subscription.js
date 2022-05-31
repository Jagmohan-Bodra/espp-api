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
        required: true,
        lowercase: true,
        validate: [isEmail, 'Email must be in email format!'],
      },
    },
    {
      timestamps: true,
    },
  );

  schema.plugin(timestampsPlusgin);
  return schema;
};
