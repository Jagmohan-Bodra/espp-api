import { body } from 'express-validator';
import _ from 'lodash';
import md5 from 'md5';
import {
  badRequest,
  badRequestFormatter,
  notFound,
  successResponse,
} from '~/routes/utils/response';
import errorMessages from '~/routes/constants/error-messages';
import { USER_GROUP_CUSTOMER_ID } from '~/routes/constants/constant';
import { generatePassword, mongooseErrMessageHelper } from '~/routes/utils';
import Models from '~/models';
import NotificationHandler from '~/handlers/notification';
import { APPROVAL_TYPE } from '~/routes/constants/master-data';

const createApproval = async ({ models, config }, data) => {
  const approval = await new models.Approval(data).save();
  const approvalId = approval._id.toHexString();

  const approveLink = `${config.APPROVAL_ROOT_LINK}/${approvalId}/approve`;
  const rejectLink = `${config.APPROVAL_ROOT_LINK}/${approvalId}/reject`;

  return { approvalId: approval._id.toHexString(), approveLink, rejectLink };
};

const createSchema = [
  body('email').isEmail().withMessage('"email" is invalid'),
];

/**
 * @param {Object} deps
 * @param {Models} deps.models
 * @param {NotificationHandler} deps.notificationHandler
 */
export default (
  { models, notificationHandler, config },
  validator,
  reCapchaAuth,
) => [
  reCapchaAuth({ config }),
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

    const user = new models.User({
      ...userParams,
      name: `${userParams.firstName || ''} ${userParams.lastName || ''}`,
      password: md5(userParams.password),
      userGroup: USER_GROUP_CUSTOMER_ID,
      active: false,
    });
    const userErrors = user.validateSync();
    if (userErrors) {
      return badRequest(res, userErrors.message);
    }
    const isDuplicateEmail = await models.User.findOne({
      email: userParams.email,
    }).exec();
    if (isDuplicateEmail) {
      return badRequest(res, badRequestFormatter('email', 'Email is existed'));
    }

    // const isDuplicatePhone = await models.User.findOne({
    //   phone: userParams.email,
    // }).exec();
    // if (isDuplicatePhone) {
    //   return badRequest(res, badRequestFormatter('phone', 'Phone is existed'));
    // }

    if (req.body.membership) {
      const membership = await models.Membership.findOne({
        _id: req.body.membership,
      });
      if (!membership) {
        return notFound(res, errorMessages.MEMBERSHIP_NOT_FOUND);
      }
    }

    const customer = new models.Customer(
      _.pick(req.body, [
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
        'customerCode',
        'personalContact',
        'salesExecutive',
        'creditTerms',
        'currency',
        'accountType',
        'remark',
        'designation',
        'contactNo',
        'personalEmail',
      ]),
    );

    const errors = customer.validateSync();
    if (errors) {
      return badRequest(res, errors.message);
    }

    await user.save().catch((err) => err);
    if (user instanceof Error) {
      return badRequest(res, mongooseErrMessageHelper(user));
    }
    customer.user = user._id;

    await customer.save().catch((err) => err);
    if (customer instanceof Error) {
      return badRequest(res, mongooseErrMessageHelper(customer));
    }

    // create approval
    const { approvalId, approveLink, rejectLink } = await createApproval(
      { models, config },
      {
        customer: customer._id,
        type: APPROVAL_TYPE.REGISTER_CUSTOMER,
        form: { password: userParams.password },
      },
    );

    // send email
    const { REGISTER_CUSTOMER } = NotificationHandler.type;
    await notificationHandler.publish(REGISTER_CUSTOMER, {
      approvalId,
      approveLink,
      rejectLink,
      data: { customer, user },
    });

    return successResponse(res, customer);
  },
];
