import { param } from 'express-validator';
import errorMessages from '~/routes/constants/error-messages';
import ROLES from '~/routes/constants/roles';

import { notFound, successResponse } from '~/routes/utils/response';
import { isObjectId } from '../../../models/util';

export default ({ models, jwt, cache, config }, authenticate, validator) => [
  authenticate(ROLES.CUSTOMER_LOGINASCUSTOMER),
  [
    param('customerId')
      .custom(isObjectId)
      .withMessage(errorMessages.CUSTOMER_ID_INVALID),
  ],
  validator,
  async (req, res) => {
    const customer = await models.Customer.findById(
      req.params.customerId,
    ).exec();
    if (!customer) {
      return notFound(res, errorMessages.CUSTOMER_NOT_FOUND);
    }
    if (!customer.user) {
      return notFound(res, errorMessages.USER_NOT_FOUND);
    }
    const token = jwt.sign(
      {
        id: customer.user._id,
        roles: (customer.user.userGroup || {}).roles || [],
      },
      { expiresIn: config.LOGIN_AS_CUSTOMER_TOKEN_EXPIRE },
    );

    await cache.setCache({ key: token, value: true });

    return successResponse(res, { token });
  },
];
