import _ from 'lodash';
import { param } from 'express-validator';
import { badRequest, notFound, successResponse } from '~/routes/utils/response';
import { getObjectId, isValid, makeUrlFriendly } from '~/routes/utils';
import Models from '~/models';
import ROLES from '~/routes/constants/roles';
import { setCacheProductCategories } from '~/routes/utils/model-cache';

/**
 * @param {Object} deps
 * @param {Models} deps.models
 */
export default ({ cache, models }, authenticate, validator) => [
  authenticate(ROLES.PRODUCT_CATEGORY_UPDATE),
  [param('id').custom(isValid).withMessage('"id" must be a objectId value')],
  validator,
  async (req, res) => {
    const data = _.pick(req.body, [
      'name',
      'code',
      'image',
      'description',
      'parent',
      'seoProps',
      'status',
      'imagePath',
    ]);

    const model = await models.ProductCategory.findOne({
      _id: getObjectId(req.params.id),
    });
    if (!model) {
      return notFound(res);
    }
    if (data.name) {
      data.url = makeUrlFriendly(data.name);
    }
    model.set(data);
    const errors = model.validateSync();
    if (errors) {
      return badRequest(res, errors);
    }

    const newModel = await model.save();
    await setCacheProductCategories({ cache, models });
    return successResponse(res, newModel);
  },
];
