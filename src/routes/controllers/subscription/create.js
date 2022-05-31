import _ from 'lodash';
import Models from '~/models';

import { mongooseErrMessageHelper } from '~/routes/utils';
import { badRequest, successResponse } from '~/routes/utils/response';

/**
 * @param {Object} deps
 * @param {Models} deps.models
 */
export default ({ models }) => [
  async (req, res) => {
    const newModel = new models.Subscription({
      ..._.pick(req.body, ['name', 'email']),
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
