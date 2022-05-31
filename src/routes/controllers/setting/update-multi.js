import _ from 'lodash';
import { body } from 'express-validator';

import { successResponse } from '~/routes/utils/response';
import { isObjectId } from '~/routes/utils/validator';
import { getValidData } from '~/routes/utils';
import { SETTING_PUBLIC_KEY } from '~/routes/constants/schema';
import Models from '~/models';
import { setCacheSettings } from '~/routes/utils/setting-cache';

/**
 * @param {Object} deps
 * @param {Models} deps.models
 */
export default ({ models, cache }, validator) => [
  [
    body('data.*._id')
      .custom(isObjectId)
      .withMessage('"id" must be a objectId value'),
    body('data.*.key').optional(),
    body('data.*.value').optional(),
    body('data.*.module').optional(),
    body('data.*.group').optional(),
    body('data.*.label').optional(),
    body('data.*.hint').optional(),
    body('data.*.inputType').optional(),
    body('data.*.language').optional(),
    body('data.*.options').optional().isArray(),
  ],
  validator,
  async (req, res) => {
    const params = getValidData(req);

    await models.Setting.bulkWrite(
      params.data.map((data) => ({
        updateOne: {
          filter: { _id: data._id },
          update: { $set: data },
        },
      })),
    );
    const results = params.data.map((item) => _.pick(item, SETTING_PUBLIC_KEY));
    await setCacheSettings({ cache, models });
    return successResponse(res, results);
  },
];
