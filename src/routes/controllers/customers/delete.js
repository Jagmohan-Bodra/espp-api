import { param } from 'express-validator';
import { notFound, successResponse } from '~/routes/utils/response';
import { isObjectId } from '~/routes/utils/validator';
import errorMessages from '~/routes/constants/error-messages';
import Models from '~/models';
import ROLES from '~/routes/constants/roles';
import { DELETE_CUSTOMER_PUBLISHER } from '~/handlers/publisher/type';

/**
 * @param {Object} deps
 * @param {Models} deps.models
 */
export default ({ models, publisherHandle }, authenticate, validator) => [
  authenticate(ROLES.CUSTOMER_DELETE),
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

    await models.InternalNote.deleteMany({ customer: customer._id });

    await customer.deleteOne();

    // publisher
    await publisherHandle.publish(DELETE_CUSTOMER_PUBLISHER, customer);

    return successResponse(res, customer);
  },
];
