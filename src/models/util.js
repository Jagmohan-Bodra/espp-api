import mongoose from 'mongoose';

export const isEmail = (v) => /^([\w-.]+@([\w-]+.)+[\w-]{2,4})?$/.test(v);

export const isObjectId = (v) => mongoose.Types.ObjectId.isValid(v);
