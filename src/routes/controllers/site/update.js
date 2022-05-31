import _ from 'lodash';
import { body, param } from 'express-validator';

import { successResponse, notFound } from '~/routes/utils/response';
import { isObjectId } from '~/routes/utils/validator';
import Models from '~/models';

const requestSchema = [
  param('id').custom(isObjectId).withMessage('"id" must be a objectId value'),
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
    const currentModel = await models.Site.findById(req.params.id).exec();

    if (!currentModel) {
      return notFound(res);
    }
    const params = _.pick(req.body, [
      'key',
      'name',
      'avatar',
      'status',
      'seoPropDefault',
    ]);
    currentModel.set(params);

    const data = await currentModel.save();

    return successResponse(res, data);
  },
];
