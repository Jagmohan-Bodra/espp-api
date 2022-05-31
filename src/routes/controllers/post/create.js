import _ from 'lodash';
import { body } from 'express-validator';
import { notFound, successResponse, badRequest } from '~/routes/utils/response';
import { isObjectId } from '~/routes/utils/validator';
import Models from '~/models';
import { makeUrlFriendly, mongooseErrMessageHelper } from '~/routes/utils';
import ROLES from '~/routes/constants/roles';

const requestSchema = [
  body('postCategoryId').optional().isArray(),
  body('name').optional(),
  body('description').optional(),
  body('url').optional(),
  body('avatar').optional(),
  body('content').optional(),
  body('pushlish').optional(),
  body('imagePath').optional(),
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
export default ({ models }, authenticate, validator) => [
  authenticate(ROLES.POST_CREATE),
  requestSchema,
  validator,
  async (req, res) => {
    const { postCategoryId } = req.body;

    const categoryValidates = (postCategoryId || []).filter(
      (categoty) => !isObjectId(categoty),
    );
    if (categoryValidates.length > 0) {
      return badRequest(
        res,
        `"Category" must be a objectId value. ${categoryValidates.join(', ')}`,
      );
    }

    const categoryNotFoundValidates = (
      await Promise.all([
        ...(postCategoryId || []).map(async (categoty) =>
          _.isEmpty(await models.PostCategory.findOne({ _id: categoty }))
            ? categoty
            : undefined,
        ),
      ])
    ).filter((item) => item);

    if (categoryNotFoundValidates.length > 0) {
      return notFound(
        res,
        `Category not found, ${categoryNotFoundValidates.join(', ')}`,
      );
    }

    const params = _.pick(req.body, [
      'name',
      'description',
      'url',
      'content',
      'pushlish',
      'seoProps',
      'styles',
      'avatar',
      'avatarPath',
    ]);
    const data = await models
      .Post({
        ...params,
        url: makeUrlFriendly(params.name),
        postCategory: postCategoryId || [],
      })
      .save()
      .catch((err) => err);
    if (data instanceof Error) {
      return badRequest(res, mongooseErrMessageHelper(data));
    }

    return successResponse(res, data);
  },
];
