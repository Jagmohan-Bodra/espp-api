import _ from 'lodash';
import Models from '~/models';
import ROLES from '~/routes/constants/roles';

import { mongooseErrMessageHelper } from '~/routes/utils';
import { badRequest, successResponse } from '~/routes/utils/response';

/**
 * @param {Object} deps
 * @param {Models} deps.models
 */
export default ({ models }, authenticate) => [
  authenticate(ROLES.TAG_CREATE),
  async (req, res) => {
    const newModel = new models.Tag({
      ..._.pick(req.body, ['name', 'description', 'seoProps', 'status']),
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
