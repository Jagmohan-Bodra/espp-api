import { body, param } from 'express-validator';
import _ from 'lodash';
import { badRequest, notFound, successResponse } from '../../utils/response';
import { isObjectId } from '~/routes/utils/validator';
import errorMessages from '~/routes/constants/error-messages';
import Models from '~/models';
import { mongooseErrMessageHelper } from '~/routes/utils';
import ROLES from '~/routes/constants/roles';
import { CUSTOMER_STATUS } from '~/routes/constants/master-data';
import {
  CUSTOMER_ACTIVE,
  CUSTOMER_INACTIVE,
} from '~/handlers/notification/type';
import { UPDATE_CUSTOMER_PUBLISHER } from '~/handlers/publisher/type';

const updateSchema = [
  param('customerId')
    .custom(isObjectId)
    .withMessage(errorMessages.CUSTOMER_ID_INVALID),
  body('membership')
    .optional()
    .custom(isObjectId)
    .withMessage(errorMessages.MEMBERSHIP_INVALID),
  body('user')
    .optional()
    .custom(isObjectId)
    .withMessage(errorMessages.USER_INVALID),
];

/**
 * @param {Object} deps
 * @param {Models} deps.models
 */
export default (
  { models, notificationHandler, publisherHandle },
  authenticate,
  validator,
) => [
  authenticate(ROLES.CUSTOMER_UPDATE),
  updateSchema,
  validator,
  async (req, res) => {
    if (req.body.user) {
      const user = await models.User.findOne({
        _id: req.body.user,
      });
      if (!user) {
        return notFound(res, errorMessages.USER_NOT_FOUND);
      }
    }

    if (req.body.membership) {
      const membership = await models.Membership.findOne({
        _id: req.body.membership,
      });
      if (!membership) {
        return notFound(res, errorMessages.MEMBERSHIP_NOT_FOUND);
      }
    }

    const currentCustomer = await models.Customer.findById(
      req.params.customerId,
    );

    if (!currentCustomer) {
      return notFound(res, errorMessages.CUSTOMER_NOT_FOUND);
    }
    const customerStatus = currentCustomer.status || '';
    currentCustomer.set(
      _.pick(req.body, [
        'customerCode',
        'membership',
        'user',
        'addressBlockNo',
        'addressStresstName',
        'addressFloor',
        'addressUnitNo',
        'addressBuildingName',
        'addressPostCode',
        'addressCity',
        'addressState',
        'addressCountry',
        'financeSalutation',
        'financeFirstName',
        'financeLastName',
        'financeContactNo',
        'financeEmail',
        'companyName',
        'companyRegNo',
        'companyContactNo',
        'companyFax',
        'companyNatureOfBusiness',
        'remark',
        'designation',
        'contactNo',
        'personalEmail',
        'personalContact',
        'salesExecutive',
        'creditTerms',
        'currency',
        'accountType',
        'status',
        'addressList',
      ]),
    );

    const errors = currentCustomer.validateSync();
    if (errors) {
      return badRequest(res, errors.message);
    }

    const updatedCustomer = await currentCustomer
      .save()
      .then(async (results) => {
        const customerData = results.toJSON();
        // sent mail
        if (
          req.body.status &&
          req.body.status !== customerStatus &&
          [CUSTOMER_STATUS.ACTIVE, CUSTOMER_STATUS.SUSPEND].indexOf(
            customerData.status,
          ) > -1
        ) {
          if (customerData.status === CUSTOMER_STATUS.ACTIVE) {
            await notificationHandler.publish(CUSTOMER_ACTIVE, {
              name: (customerData.user || {}).name,
              sender: (customerData.user || {}).email,
              data: customerData,
            });
          }
          if (customerData.status === CUSTOMER_STATUS.SUSPEND) {
            await notificationHandler.publish(CUSTOMER_INACTIVE, {
              name: (customerData.user || {}).name,
              sender: (customerData.user || {}).email,
              data: customerData,
            });
          }
        }
        return customerData;
      })
      .catch((err) => err);
    if (updatedCustomer instanceof Error) {
      return badRequest(res, mongooseErrMessageHelper(updatedCustomer));
    }

    // publisher
    await publisherHandle.publish(UPDATE_CUSTOMER_PUBLISHER, {
      ...updatedCustomer,
    });

    return successResponse(res, updatedCustomer);
  },
];
