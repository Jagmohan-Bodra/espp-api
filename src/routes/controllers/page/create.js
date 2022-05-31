import _ from 'lodash';
import { body } from 'express-validator';
import { badRequest, successResponse } from '~/routes/utils/response';
import Models from '~/models';
import { makeUrlFriendly, mongooseErrMessageHelper } from '~/routes/utils';
import ROLES from '~/routes/constants/roles';

const requestSchema = [
  body('name').optional(),
  body('description').optional(),
  body('url').optional(),
  body('content').optional(),
  body('pushlish').optional(),
  body('seoProps')
    .optional()
    .isObject()
    .withMessage('"seoProps" should be object'),
  body('styles').optional().isObject().withMessage('"styles" should be object'),
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
      'name',
      'description',
      'url',
      'content',
      'pushlish',
      'seoProps',
      'styles',
      'theme',
    ]);
    const data = await models
      .Page(params)
      .save()
      .catch((err) => err);
    if (data instanceof Error) {
      return badRequest(res, mongooseErrMessageHelper(data));
    }

    return successResponse(res, data);
  },
];
