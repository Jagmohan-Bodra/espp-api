import _ from 'lodash';
import { body, param } from 'express-validator';

import { successResponse, notFound, badRequest } from '~/routes/utils/response';
import { isObjectId } from '~/routes/utils/validator';
import Models from '~/models';
import { makeUrlFriendly, mongooseErrMessageHelper } from '~/routes/utils';
import ROLES from '~/routes/constants/roles';

const requestSchema = [
  param('id').custom(isObjectId).withMessage('"id" must be a objectId value'),
  body('name').optional(),
  body('url').optional(),
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
  authenticate(ROLES.POST_CATEGORY_UPDATE),
  requestSchema,
  validator,
  async (req, res) => {
    const currentModel = await models.PostCategory.findById(
      req.params.id,
    ).exec();

    if (!currentModel) {
      return notFound(res);
    }
    if (req.body.parent) {
      const categotyModel = await models.PostCategory.findOne({
        _id: req.body.parent,
      });
      if (!categotyModel) {
        return notFound(res, 'Category not found');
      }
    }

    const params = _.pick(req.body, [
      'name',
      'url',
      'description',
      'seoProps',
      'status',
      'parent',
    ]);
    if (params.name) {
      params.url = makeUrlFriendly(params.name);
    }
    currentModel.set(params);

    const data = await currentModel.save().catch((err) => err);
    if (data instanceof Error) {
      return badRequest(res, mongooseErrMessageHelper(data));
    }

    return successResponse(res, data);
  },
];
