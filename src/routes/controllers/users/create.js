import _ from 'lodash';
import { body } from 'express-validator';
import md5 from 'md5';
import {
  badRequest,
  successResponse,
  badRequestFormatter,
} from '~/routes/utils/response';
import { CREATE_USER } from '~/handlers/notification/type';
import { generatePassword, mongooseErrMessageHelper } from '~/routes/utils';
import NotificationHandler from '~/handlers/notification';
import Models from '~/models';
import ROLES from '~/routes/constants/roles';

const requestSchema = [
  body('email').isEmail().withMessage('"email" is invalid'),
  body('phone').isMobilePhone().withMessage('"phone" is invalid'),
  body('userCode').optional(),
  body('password').optional(),
  body('firstName').optional(),
  body('lastName').optional(),
  body('birthday').optional(),
  body('address').optional(),
  body('gender').optional(),
  body('salutation').optional(),
  body('avatar').optional(),
  body('accountType').optional(),
  body('userGroup').optional(),
  body('avatarPath').optional(),
];

/**
 * @param {Object} deps
 * @param {Models} deps.models
 * @param {NotificationHandler} deps.notificationHandler
 */
export default ({ models, notificationHandler }, authenticate, validator) => [
  authenticate(ROLES.USER_CREATE),
  requestSchema,
  validator,
  async (req, res) => {
    const { phone, email, firstName, lastName } = req.body;

    const isDuplicatePhone = await models.User.findOne({ phone }).exec();
    if (isDuplicatePhone) {
      return badRequest(res, badRequestFormatter('phone', 'Phone is existed'));
    }

    const isDuplicateEmail = await models.User.findOne({ email }).exec();
    if (isDuplicateEmail) {
      return badRequest(res, badRequestFormatter('email', 'Email is existed'));
    }

    const name = `${firstName} ${lastName}`;
    const newPass = generatePassword(8);
    const params = _.pick(req.body, [
      'password',
      'avatar',
      'accountType',
      'firstName',
      'lastName',
      'salutation',
      'birthday',
      'address',
      'gender',
      'phone',
      'email',
      'userGroup',
      'userCode',
      'active',
      'avatarPath',
    ]);
    params.password = md5(newPass);
    const newUser = await models
      .User({ ...params, name })
      .save()
      .catch((err) => err);
    if (newUser instanceof Error) {
      return badRequest(res, mongooseErrMessageHelper(newUser));
    }

    // send email
    await notificationHandler.publish(CREATE_USER, {
      name: newUser.name,
      sender: newUser.email,
      password: newPass,
    });

    return successResponse(res, newUser);
  },
];
