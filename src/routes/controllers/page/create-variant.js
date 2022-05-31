import _ from 'lodash';
import { param } from 'express-validator';

import { successResponse, notFound, badRequest } from '~/routes/utils/response';
import { isObjectId } from '~/routes/utils/validator';
import Models from '~/models';
import { mongooseErrMessageHelper } from '~/routes/utils';

const requestSchema = [
  param('id').custom(isObjectId).withMessage('"id" must be a objectId value'),
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
      'group',
      'type',
      'label',
      'key',
      'value',
      'order',
    ]);
    const data = new models.Variant(params);
    const errors = data.validateSync();
    if (errors) {
      return badRequest(res, errors.message);
    }

    const currentModel = await models.Page.findById(req.params.id).exec();
    if (!currentModel) {
      return notFound(res, 'Page not found');
    }

    const variant = await data.save().catch((err) => err);
    if (variant instanceof Error) {
      return badRequest(res, mongooseErrMessageHelper(variant));
    }

    currentModel.set({
      variants: [...(currentModel.variants || []), variant._id],
    });
    const pageData = await currentModel.save().catch((err) => err);
    if (pageData instanceof Error) {
      return badRequest(res, mongooseErrMessageHelper(pageData));
    }

    return successResponse(res, variant);
  },
];
