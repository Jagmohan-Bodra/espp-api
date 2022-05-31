import _ from 'lodash';
import { param } from 'express-validator';
import { isObjectId } from '~/routes/utils/validator';

import { notFound, successResponse } from '~/routes/utils/response';
import { USER_PUBLIC_KEY } from '~/routes/constants/schema';
import Models from '~/models';
import ROLES from '~/routes/constants/roles';

const payloadSchema = [
  param('id').custom(isObjectId).withMessage('"id" must be a objectId value'),
];

/**
 * @param {Object} deps
 * @param {Models} deps.models
 */
export default ({ models }, authenticate, validator) => [
  authenticate(ROLES.USER_GET),
  payloadSchema,
  validator,
  async (req, res) => {
    const users = await models.User.findOne({ _id: req.params.id });

    if (!users) {
      return notFound(res);
    }

    const results = _.pick(users, USER_PUBLIC_KEY);
    return successResponse(res, results);
  },
];
