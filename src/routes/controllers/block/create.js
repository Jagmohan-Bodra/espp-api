import _ from 'lodash';
import { body } from 'express-validator';
import { badRequest, successResponse } from '~/routes/utils/response';
import Models from '~/models';
import { mongooseErrMessageHelper } from '~/routes/utils';
import ROLES from '~/routes/constants/roles';

const requestSchema = [
  body('name').optional(),
  body('description').optional(),
  body('avatar').optional(),
  body('groupCode').optional(),
  body('styles').optional().isObject(),
  body('content').optional(),
  body('status').optional(),
];

/**
 * @param {Object} deps
 * @param {Models} deps.models
 */
export default ({ models }, authenticate, validator) => [
  authenticate(ROLES.BLOCK_CREATE),
  requestSchema,
  validator,
  async (req, res) => {
    const params = _.pick(req.body, [
      'name',
      'description',
      'avatar',
      'groupCode',
      'styles',
      'content',
      'status',
      'position',
    ]);
    const data = await models
      .Block({ ...params })
      .save()
      .catch((err) => err);
    if (data instanceof Error) {
      return badRequest(res, mongooseErrMessageHelper(data));
    }
    return successResponse(res, data);
  },
];
