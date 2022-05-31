import _ from 'lodash';
import Models from '~/models';
import ROLES from '~/routes/constants/roles';
import { makeUrlFriendly, mongooseErrMessageHelper } from '~/routes/utils';
import { badRequest, successResponse } from '~/routes/utils/response';

/**
 * @param {Object} deps
 * @param {Models} deps.models
 */
export default ({ models }, authenticate) => [
  authenticate(ROLES.BRAND_CREATE),
  async (req, res) => {
    const newModel = new models.Brand({
      ..._.pick(req.body, [
        'name',
        'code',
        'image',
        'description',
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

    const result = await newModel.save().catch((err) => err);
    if (result instanceof Error) {
      return badRequest(res, mongooseErrMessageHelper(result));
    }

    return successResponse(res, result);
  },
];
