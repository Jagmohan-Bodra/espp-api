import _ from 'lodash';
import { body } from 'express-validator';
import { getNow } from '~/routes/utils/date';
import { badRequest, notFound, successResponse } from '~/routes/utils/response';
import { isObjectId } from '~/routes/utils/validator';
import Models from '~/models';
import { makeUrlFriendly, mongooseErrMessageHelper } from '~/routes/utils';
import ROLES from '~/routes/constants/roles';

const requestSchema = [
  body('name').optional(),
  body('description').optional(),
  body('seoProps')
    .optional()
    .isObject()
    .withMessage('"seoProps" Should be object'),
  body('status').optional(),
  body('parent')
    .optional()
    .custom(isObjectId)
    .withMessage('"parent" must be a objectId value'),
];

/**
 * @param {Object} deps
 * @param {Models} deps.models
 */
export default ({ models }, authenticate, validator) => [
  authenticate(ROLES.POST_CATEGORY_CREATE),
  requestSchema,
  validator,
  async (req, res) => {
    const params = _.pick(req.body, [
      'name',
      'url',
      'description',
      'seoProps',
      'status',
      'parent',
    ]);
    if (req.body.parent) {
      const categotyModel = await models.PostCategory.findOne({
        _id: req.body.parent,
      });
      if (!categotyModel) {
        return notFound(res, 'Category not found');
      }
    }

    const data = await models
      .PostCategory({ ...params, url: makeUrlFriendly(params.name) })
      .save()
      .catch((err) => err);
    if (data instanceof Error) {
      return badRequest(res, mongooseErrMessageHelper(data));
    }

    return successResponse(res, data);
  },
];
