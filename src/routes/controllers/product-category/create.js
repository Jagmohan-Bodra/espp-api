import _ from 'lodash';
import Models from '~/models';
import ROLES from '~/routes/constants/roles';
import { makeUrlFriendly } from '~/routes/utils';
import { setCacheProductCategories } from '~/routes/utils/model-cache';

import { badRequest, successResponse } from '~/routes/utils/response';

/**
 * @param {Object} deps
 * @param {Models} deps.models
 */
export default ({ models, cache }, authenticate) => [
  authenticate(ROLES.PRODUCT_CATEGORY_CREATE),
  async (req, res) => {
    const newModel = new models.ProductCategory({
      ..._.pick(req.body, [
        'name',
        'code',
        'image',
        'description',
        'parent',
        'seoProps',
        'status',
        'imagePath',
      ]),
      url: makeUrlFriendly(req.body.name),
    });

    const errors = newModel.validateSync();
    if (errors) {
      return badRequest(res, errors.message);
    }

    const result = await newModel.save();
    await setCacheProductCategories({ cache, models });
    return successResponse(res, result);
  },
];
