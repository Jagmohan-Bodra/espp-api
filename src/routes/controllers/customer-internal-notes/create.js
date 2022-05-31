import _ from 'lodash';
import moment from 'moment';
import { param } from 'express-validator';
import { isValid } from '../../utils';
import Models from '~/models';
import { badRequest, successResponse, notFound } from '~/routes/utils/response';
import errorMessages from '~/routes/constants/error-messages';
import ROLES from '~/routes/constants/roles';

/**
 * @param {Object} deps
 * @param {Models} deps.models
 */
export default ({ models }, authenticate, validator) => [
  authenticate(ROLES.CUSTOMER_INTERNALNOTE_CREATE),
  [
    param('customerId')
      .custom(isValid)
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

    const data = new models.InternalNote({
      user: req.context.tokenInfo.id,
      sendDate: moment().format(),
      message: req.body.message,
      publish: true,
      customer: req.params.customerId,
    });

    const errors = data.validateSync();

    if (errors) {
      return badRequest(res, errors.message);
    }
    await data.save();

    customer.set({
      ...customer,
      internalNote: [...customer.internalNote, data._id],
    });

    await customer.save();

    return successResponse(res, data);
  },
];
