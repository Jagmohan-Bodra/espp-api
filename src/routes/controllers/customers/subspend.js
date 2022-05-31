import { param } from 'express-validator';
import Cache from '~/clients/cache';
import Models from '~/models';
import errorMessages from '~/routes/constants/error-messages';
import ROLES from '~/routes/constants/roles';

import { isObjectId } from '~/routes/utils/validator';
import { notFound, successResponse } from '../../utils/response';

/**
 * @param {Object} deps
 * @param {Models} deps.models
 * @param {Cache} deps.cache
 */
export default ({ models, cache }, authenticate, validator) => [
  authenticate(ROLES.CUSTOMER_SUBPENDCUSTOMER),
  [
    param('customerId')
      .custom(isObjectId)
      .withMessage(errorMessages.CUSTOMER_ID_INVALID),
  ],
  validator,
  async (req, res) => {
    const customer = await models.Customer.findOne({
      _id: req.params.customerId,
    }).populate('user');

    if (!customer) {
      return notFound(res, errorMessages.CUSTOMER_NOT_FOUND);
    }

    const { user } = customer;

    if (!user) {
      return notFound(res, errorMessages.USER_NOT_FOUND);
    }

    const { validTokens } = user;

    await Promise.all(
      (validTokens || []).map((token) => cache.removeCache({ key: token })),
    );

    await user.set({ active: false, validTokens: [] }).save();

    return successResponse(res);
  },
];
