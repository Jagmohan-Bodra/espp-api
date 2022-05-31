import { body } from 'express-validator';
import _ from 'lodash';
import {
  badRequest,
  badRequestFormatter,
  notFound,
  successResponse,
} from '~/routes/utils/response';
import errorMessages from '~/routes/constants/error-messages';
import { USER_GROUP_CUSTOMER_ID } from '~/routes/constants/constant';
import { mongooseErrMessageHelper } from '~/routes/utils';
import Models from '~/models';
import NotificationHandler from '~/handlers/notification';

const createSchema = [
  // body('membership')
  //   .optional()
  //   .custom(isObjectId)
  //   .withMessage(errorMessages.MEMBERSHIP_INVALID),
  body('email').isEmail().withMessage('"email" is invalid'),
  body('password').notEmpty(),
];

/**
 * @param {Object} deps
 * @param {Models} deps.models
 * @param {NotificationHandler} deps.notificationHandler
 */
export default ({ models, notificationHandler }, validator) => [
  createSchema,
  validator,
  async (req, res) => {
    const userParams = _.pick(req.body, [
      'salutation',
      'phone',
      'email',
      'firstName',
      'lastName',
      'password',
    ]);
    const { password } = userParams;
    const userData = new models.User({
      ...userParams,
      name: `${userParams.firstName || ''} ${userParams.lastName || ''}`,
      userGroup: USER_GROUP_CUSTOMER_ID,
    });
    const userErrors = userData.validateSync();
    if (userErrors) {
      return badRequest(res, userErrors.message);
    }
    const isDuplicateEmail = await models.User.findOne({
      email: userParams.email,
    }).exec();
    if (isDuplicateEmail) {
      return badRequest(res, badRequestFormatter('email', 'Email is existed'));
    }

    if (req.body.membership) {
      const membership = await models.Membership.findOne({
        _id: req.body.membership,
      });
      if (!membership) {
        return notFound(res, errorMessages.MEMBERSHIP_NOT_FOUND);
      }
    }

    const data = new models.Customer(
      _.pick(req.body, [
        'customerCode',
        'membership',
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
      ]),
    );

    const errors = data.validateSync();
    if (errors) {
      return badRequest(res, errors.message);
    }

    await userData.save().catch((err) => err);
    if (userData instanceof Error) {
      return badRequest(res, mongooseErrMessageHelper(userData));
    }
    data.user = userData._id;

    await data.save().catch((err) => err);
    if (data instanceof Error) {
      return badRequest(res, mongooseErrMessageHelper(data));
    }

    // send email
    const { CREATE_USER } = NotificationHandler.type;
    await notificationHandler.publish(CREATE_USER, {
      name: userData.name,
      sender: userData.email,
      password,
    });

    return successResponse(res, data);
  },
];
