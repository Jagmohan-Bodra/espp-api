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
  authenticate(ROLES.MEMBERSHIP_CREATE),
  async (req, res) => {
    const data = new models.Membership(
      _.pick(req.body, ['name', 'description', 'discountPercent', 'isDefault']),
    );

    const errors = data.validateSync();

    if (errors) {
      return badRequest(res, errors.message);
    }

    await data
      .save()
      .then(async (results) => {
        if (results.isDefault) {
          await models.Membership.updateMany(
            {
              _id: {
                $ne: results._id,
              },
            },
            {
              $set: {
                isDefault: false,
              },
            },
          );
        }
        return results;
      })
      .catch((err) => err);
    if (data instanceof Error) {
      return badRequest(res, mongooseErrMessageHelper(data));
    }

    return successResponse(res, data);
  },
];
