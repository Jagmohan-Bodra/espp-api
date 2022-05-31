import _ from 'lodash';
import { param } from 'express-validator';
import { badRequest, notFound, successResponse } from '../../utils/response';
import errorMessages from '~/routes/constants/error-messages';
import Models from '~/models';
import { mongooseErrMessageHelper, getObjectId } from '~/routes/utils';
import { isObjectId } from '~/models/util';

/**
 * @param {Object} deps
 * @param {Models} deps.models
 */
export default ({ models }, validator) => [
  [param('addressId').custom(isObjectId).withMessage(errorMessages.ID_INVALID)],
  validator,
  async (req, res) => {
    const { id } = (req.context || {}).tokenInfo || {};
    const currentCustomer = await models.Customer.findOne({
      user: getObjectId(id),
    });

    if (!currentCustomer) {
      return notFound(res, errorMessages.CUSTOMER_NOT_FOUND);
    }

    const newAddresses = (currentCustomer.toJSON().addresses || [])
      .map((item) => {
        if (item._id == req.params.addressId) {
          return undefined;
        }
        return item;
      })
      .filter((item) => item);

    currentCustomer.set({ addresses: newAddresses });

    const errors = currentCustomer.validateSync();
    if (errors) {
      return badRequest(res, errors.message);
    }

    const updatedCustomer = await currentCustomer.save().catch((err) => err);
    if (updatedCustomer instanceof Error) {
      return badRequest(res, mongooseErrMessageHelper(updatedCustomer));
    }

    return successResponse(res);
  },
];
