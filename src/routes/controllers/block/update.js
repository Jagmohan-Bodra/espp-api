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
  authenticate(ROLES.BLOCK_UPDATE),
  requestSchema,
  validator,
  async (req, res) => {
    const currentModel = await models.Block.findById(req.params.id).exec();

    if (!currentModel) {
      return notFound(res);
    }
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
    currentModel.set(params);

    const data = await currentModel.save().catch((err) => err);
    if (data instanceof Error) {
      return badRequest(res, mongooseErrMessageHelper(data));
    }

    return successResponse(res, data);
  },
];
