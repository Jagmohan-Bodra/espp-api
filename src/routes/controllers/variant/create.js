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

    const result = await data.save().catch((err) => err);
    if (result instanceof Error) {
      return badRequest(res, mongooseErrMessageHelper(result));
    }

    return successResponse(res, result);
  },
];
