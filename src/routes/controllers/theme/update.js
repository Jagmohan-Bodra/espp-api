import _ from 'lodash';
import { body, param } from 'express-validator';

import { successResponse, notFound, badRequest } from '~/routes/utils/response';
import { isObjectId } from '~/routes/utils/validator';
import Models from '~/models';
import { mongooseErrMessageHelper } from '~/routes/utils';
import ROLES from '~/routes/constants/roles';

const requestSchema = [
  param('id').custom(isObjectId).withMessage('"id" must be a objectId value'),
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
  authenticate(ROLES.THEME_UPDATE),
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

    const currentModel = await models.Theme.findById(req.params.id).exec();
    if (!currentModel) {
      return notFound(res, 'Theme not found');
    }

    currentModel.set(params);
    const data = await currentModel.save().catch((err) => err);
    if (data instanceof Error) {
      return badRequest(res, mongooseErrMessageHelper(data));
    }

    return successResponse(res, data);
  },
];
