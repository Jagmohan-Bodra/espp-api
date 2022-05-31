import { param } from 'express-validator';
import mongoose from 'mongoose';
import Models from '~/models';
import ROLES from '~/routes/constants/roles';

import { notFound, successResponse } from '~/routes/utils/response';

const rules = [
  param('id')
    .custom((val) => mongoose.Types.ObjectId.isValid(val))
    .withMessage('"id" is not valid.'),
];

/**
 * @param {Object} deps
 * @param {Models} deps.models
 */
export default ({ models }, authenticate, validator) => [
  authenticate(ROLES.USER_DELETE),
  rules,
  validator,
  async (req, res) => {
    const currentUser = await models.User.findById(req.params.id).exec();
    if (!currentUser) {
      return notFound(res);
    }

    currentUser.deleteOne();

    return successResponse(res, currentUser);
  },
];
