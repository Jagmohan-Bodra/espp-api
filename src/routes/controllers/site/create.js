import _ from 'lodash';
import { body } from 'express-validator';
import { getNow } from '~/routes/utils/date';
import { successResponse } from '~/routes/utils/response';
import Models from '~/models';

const requestSchema = [
  body('key').optional(),
  body('name').optional(),
  body('avatar').optional(),
  body('seoPropDefault')
    .optional()
    .isObject()
    .withMessage('"seoPropDefault" Should be object'),
  body('status').optional(),
];

/**
 * @param {Object} deps
 * @param {Models} deps.models
 */
export default ({ models }, validator) => [
  requestSchema,
  validator,
  async (req, res) => {
    const params = _.pick(req.body, [
      'key',
      'name',
      'avatar',
      'status',
      'seoPropDefault',
    ]);
    const data = await models.Site({ ...params, updatedAt: getNow() }).save();

    return successResponse(res, data);
  },
];
