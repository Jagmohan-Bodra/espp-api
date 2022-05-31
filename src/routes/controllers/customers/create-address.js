import _ from 'lodash';
import { badRequest, notFound, successResponse } from '../../utils/response';
import errorMessages from '~/routes/constants/error-messages';
import Models from '~/models';
import { mongooseErrMessageHelper, getObjectId } from '~/routes/utils';

/**
 * @param {Object} deps
 * @param {Models} deps.models
 */
export default ({ models }) => async (req, res) => {
  const { id } = (req.context || {}).tokenInfo || {};
  const currentCustomer = await models.Customer.findOne({
    user: getObjectId(id),
  });

  if (!currentCustomer) {
    return notFound(res, errorMessages.CUSTOMER_NOT_FOUND);
  }

  const _id = getObjectId();
  currentCustomer.set({
    addresses: [
      ...(currentCustomer.addresses || []),
      {
        _id,
        ...req.body,
      },
    ],
  });
  if (req.body.isDefault) {
    currentCustomer.set({
      addressesDefault: _id,
    });
  }

  const errors = currentCustomer.validateSync();
  if (errors) {
    return badRequest(res, errors.message);
  }

  const updatedCustomer = await currentCustomer.save().catch((err) => err);
  if (updatedCustomer instanceof Error) {
    return badRequest(res, mongooseErrMessageHelper(updatedCustomer));
  }

  return successResponse(res, _id);
};
