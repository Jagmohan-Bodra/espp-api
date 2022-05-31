import { body } from 'express-validator';
import md5 from 'md5';
import _, { isEmpty, isString } from 'lodash';
import { USER_PUBLIC_KEY } from '../constants/schema';
import { getNow } from '~/routes/utils/date';
import {
  successResponse,
  unAuthorize,
  notFound,
  validateResponse,
  forbidden,
  badRequest,
} from '../utils/response';
import { generatePassword, mongooseErrMessageHelper } from '../utils';
import { FORGOT_PASSWORD } from '~/handlers/notification/type';
import errorMessages from '../constants/error-messages';
import Models from '~/models';
import Jwt from '~/wrappers/jwt';
import Cache from '~/clients/cache';

const signInSchema = [
  body('email')
    .notEmpty()
    .withMessage('"email" is not allowed to be empty')
    .isEmail()
    .withMessage('Invalid Email'),
  body('password')
    .notEmpty()
    .withMessage('"password" is not allowed to be empty'),
];

/**
 * @param {Object} deps
 * @param {Models} deps.models
 * @param {Jwt} deps.jwt
 * @param {Cache} deps.cache
 */

export const signIn = ({ models, jwt, cache }, validator) => [
  signInSchema,
  validator,
  async (req, res) => {
    const { password } = req.body;
    const email = req.body.email.toLowerCase();

    const user = await models.User.findOne({ email }).populate('userGroup');

    // validate
    if (_.isEmpty(user)) {
      return unAuthorize(res, 'Email is not exist.');
    }

    if (user.password !== password) {
      return unAuthorize(res, 'Password incorrect.');
    }

    if (!user.active) {
      return forbidden(res, errorMessages.ACCOUNT_INACTIVE);
    }

    // generate access token
    const token = jwt.sign({
      id: user._id,
      // roles: (user.userGroup || {}).roles || [],
    });

    // saving token to db
    if (!user.validTokens.includes(token)) {
      user.validTokens.push(token);
      user.lastLogin = getNow();
      await user.save();
    }

    // caching access token
    await cache.setCache({ key: token, value: user.toJSON() });

    return successResponse(res, { token });
  },
];

export const signOut = ({ models, cache }) => async (req, res) => {
  const { id } = req.context.tokenInfo;
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  const user = await models.User.findOne({ _id: id });

  // validate
  if (_.isEmpty(user)) {
    return notFound(res);
  }

  // remove token
  await cache.removeCache({ key: token });
  const newValidTokens = user.validTokens || [];
  if (!isEmpty(token) && isString(token)) {
    const index = newValidTokens.indexOf(token);
    if (index > -1) {
      newValidTokens.splice(index, 1);
    }
  }

  user.validTokens = newValidTokens;
  await user.save();

  return successResponse(res);
};

export const getMe = ({ models }) => async (req, res) => {
  const { id } = req.context.tokenInfo;
  const user = await models.User.findOne({ _id: id });
  const customer = await models.Customer.findOne({ user: id }).select(
    '-user -internalNote -promotionCoupon',
  );
  const wishlist = await models.Wishlist.find({
    customer: (customer || {})._id,
  }).exec();

  // validate
  if (_.isEmpty(user)) {
    return notFound(res);
  }
  const results = {
    ..._.pick(user, USER_PUBLIC_KEY),
    customer,
    wishlist: wishlist.map((item) => ({
      _id: item._id,
      product: item.product._id,
    })),
  };
  return successResponse(res, results);
};

export const resetPassword = ({ models, notificationHandler }, validator) => [
  [body('email').isEmail().withMessage('Invalid email address')],
  validator,
  async (req, res) => {
    const { email } = req.body;
    const newPass = generatePassword(8);

    // validate
    const currentUser = await models.User.findOne({ email });
    if (!currentUser) {
      return notFound(res);
    }

    // update model
    currentUser.password = md5(newPass);
    const updatedUser = await currentUser.save();

    // sent mail
    await notificationHandler.publish(FORGOT_PASSWORD, {
      name: updatedUser.name,
      sender: email,
      password: newPass,
    });

    return successResponse(res);
  },
];

export const changePassword = ({ models }, validator) => [
  [body('oldPassword').notEmpty(), body('newPassword').notEmpty()],
  validator,
  async (req, res) => {
    const { id } = req.context.tokenInfo;
    const { oldPassword, newPassword } = req.body;
    const user = await models.User.findOne({ _id: id });

    // validate
    if (_.isEmpty(user)) {
      return notFound(res);
    }
    if (user.password !== oldPassword) {
      return validateResponse(res, 'password incorrect');
    }

    // save
    user.password = newPassword;
    await user.save();
    return successResponse(res);
  },
];

export const changeEmail = ({ models, notificationHandler }, validator) => [
  [body('email').notEmpty()],
  validator,
  async (req, res) => {
    const { id } = req.context.tokenInfo;
    const { email } = req.body;
    const newPass = generatePassword(8);
    const user = await models.User.findOne({ _id: id });

    // validate
    if (_.isEmpty(user)) {
      return notFound(res);
    }

    // save
    user.password = md5(newPass);
    user.email = email;
    const results = await user.save().catch((err) => err);
    if (results instanceof Error) {
      return badRequest(res, mongooseErrMessageHelper(results));
    }
    // sent mail
    await notificationHandler.publish(FORGOT_PASSWORD, {
      name: user.name,
      sender: email,
      password: newPass,
    });
    return successResponse(res);
  },
];
