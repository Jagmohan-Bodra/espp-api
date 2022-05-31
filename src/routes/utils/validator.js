import mongoose from 'mongoose';

export const isObjectId = (val) => mongoose.Types.ObjectId.isValid(val);
export const exampleCustomerValidator = (val) => val;
