import _ from 'lodash';
import { body } from 'express-validator';
import { badRequest, successResponse } from '~/routes/utils/response';
import Models from '~/models';
import { mongooseErrMessageHelper } from '~/routes/utils';
import ROLES from '~/routes/constants/roles';

const requestSchema = [
  body('name').optional(),
  body('description').optional(),
  body('content').optional(),
  body('pushlish').optional(),
  body('styles').optional().isObject().withMessage('"styles" should be object'),
];

/**
 * @param {Object} deps
 * @param {Models} deps.models
 */
export default ({ models }, authenticate, validator) => [
  authenticate(ROLES.THEME_CREATE),
  requestSchema,
  validator,
  async (req, res) => {
    const params = _.pick(req.body, [
      'name',
      'description',
      'content',
      'pushlish',
      'styles',
    ]);
    const data = await models
      .Theme(params)
      .save()
      .catch((err) => err);
    if (data instanceof Error) {
      return badRequest(res, mongooseErrMessageHelper(data));
    }

    return successResponse(res, data);
  },
];
