import moment from 'moment';
import mongoose from 'mongoose';
import { query, matchedData } from 'express-validator';
import lz from 'lzutf8';

export const getObjectId = (id) => mongoose.Types.ObjectId(id);
export const mongooseErrMessageHelper = (err) => {
  if (!(err instanceof Error)) {
    return { message: 'Bad Request' };
  }
  switch (err.code) {
    case 11001:
    case 11000:
      return Object.keys(err.keyValue || {}).map((errKey) => ({
        arg: errKey,
        reason: 'Duplicate key',
      }));

    default:
      return {
        message: 'Bad Request',
      };
  }
};

const monthOfYearValue = (monthOfYear) => {
  const startOfMonth = moment(monthOfYear, 'YYYY-MM').startOf('month');
  const endOfMonth = moment(monthOfYear, 'YYYY-MM').endOf('month');
  return {
    $gt: startOfMonth,
    $lt: endOfMonth,
  };
};

export const queryBuilder = (params) => {
  const supportedOperators = {
    lte: (val) => ({ $lte: parseInt(val, 10) }),
    gte: (val) => ({ $gte: parseInt(val, 10) }),
    regex: (val) => ({
      $regex: val.toLowerCase().replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'),
      $options: 'i',
    }),
    in: (val) => ({ $in: val }),
    inObjectId: (val) => ({ $in: val.map((item) => getObjectId(item)) }),
    nin: (val) => ({ $nin: val }),
    ninObjectId: (val) => ({ $nin: val.map((item) => getObjectId(item)) }),
    inMonthOfYear: (val) => monthOfYearValue(val),
    equal: (val) => ({ $eq: val == 1 ? true : val == 0 ? false : val }),
    nequal: (val) => ({ $ne: val == 1 ? true : val == 0 ? false : val }),
  };

  return Object.keys(params || {}).reduce((prev, fieldName) => {
    let nextLoop = prev;

    Object.keys(params[fieldName] || {}).forEach((operator) => {
      const filterValue = params[fieldName][operator];
      if (operator === 'objectId' && filterValue.length === 24) {
        nextLoop = {
          ...nextLoop,
          [fieldName]: mongoose.Types.ObjectId(filterValue),
        };
      }

      const builder = supportedOperators[operator];
      if (builder instanceof Function) {
        nextLoop = {
          ...nextLoop,
          [fieldName]: {
            ...nextLoop[fieldName],
            ...builder(filterValue),
          },
        };
      }
    });

    return nextLoop;
  }, {});
};

export const paginateBuilder = ({ pageSize, page, sort }) => ({
  limit: parseInt(pageSize, 10),
  skip: (parseInt(page, 10) - 1) * parseInt(pageSize, 10),
  sort: (sort || []).length > 0 ? (sort || []).join(' ') : '-createdAt',
});

export const getValidData = (req) => ({
  ...matchedData(req, { onlyValidData: true }),
});

export const basicMetadata = [
  query('meta.pageSize').optional(),
  query('meta.page').optional(),
  query('meta.sort').optional(),
];

// export const makeUrlFriendly = (str = '') =>
//   str
//     .replace(/[^a-z0-9_]+/gi, '-')
//     .replace(/^-|-$/g, '')
//     .toLowerCase();

export const generatePassword = (number) => {
  let result = '';
  const str = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < number; i += 1) {
    result += str.charAt(Math.floor(Math.random() * str.length));
  }
  return result;
};

export const isValid = (id) => mongoose.Types.ObjectId.isValid(id);
export const getEnum = (masterData) => [...Object.values(masterData), ''];
export const fixNumber = (number) => Number(number.toFixed(6));

export const encode = (json) =>
  json ? lz.encodeBase64(lz.compress(json)) : '';
export const decode = (json) =>
  json ? lz.decompress(lz.decodeBase64(json)) : '';

export const makeUrlFriendly = (str = '') =>
  str
    .replace(/[^a-z0-9_.]+/gi, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();

export const getFileName = (objectName) => objectName.split('/').pop();
