import _ from 'lodash';
import { body, param } from 'express-validator';

import {
  successResponse,
  notFound,
  badRequestFormatter,
  badRequest,
} from '~/routes/utils/response';
import { isObjectId } from '~/routes/utils/validator';
import Models from '~/models';
import { mongooseErrMessageHelper } from '~/routes/utils';
import ROLES from '~/routes/constants/roles';

const requestSchema = [
  param('id').custom(isObjectId).withMessage('"id" must be a objectId value'),
  body('firstName').optional(),
  body('lastName').optional(),
  body('birthday').optional(),
  body('address').optional(),
  body('gender').optional(),
  body('salutation').optional(),
  body('avatar').optional(),
  body('avatarPath').optional(),
  body('accountType').optional(),
  body('userGroup').optional(),
  body('userCode').optional(),
];

/**
 * @param {Object} deps
 * @param {Models} deps.models
 */
export default ({ models }, authenticate, validator) => [
  authenticate(ROLES.USER_UPDATE),
  requestSchema,
  validator,
  async (req, res) => {
    const { userGroup, firstName, lastName } = req.body;
    let params = _.pick(req.body, [
      'userCode',
      'firstName',
      'lastName',
      'birthday',
      'address',
      'gender',
      'salutation',
      'avatar',
      'accountType',
      'userGroup',
      'phone',
      'active',
      'avatarPath',
    ]);
    const currentUser = await models.User.findById(req.params.id).exec();
    if (!currentUser) {
      return notFound(res);
    }

    // if (params.phone) {
    //   const isDuplicatePhone = await models.User.findOne({
    //     phone: params.phone,
    //   }).exec();
    //   if (isDuplicatePhone) {
    //     return badRequest(
    //       res,
    //       badRequestFormatter('phone', 'Phone is existed'),
    //     );
    //   }
    // }

    if (userGroup) {
      const isExistUserGroup = await models.UserGroup.findById(
        userGroup,
      ).exec();
      if (!isExistUserGroup) {
        return badRequest(
          res,
          badRequestFormatter('userGroup', 'userGroup is not existed'),
        );
      }
    }
    if (firstName && lastName) {
      params = { ...params, name: `${firstName} ${lastName}` };
    }
    currentUser.set(params);
    const updatedUser = await currentUser.save().catch((err) => err);
    if (updatedUser instanceof Error) {
      return badRequest(res, mongooseErrMessageHelper(updatedUser));
    }

    return successResponse(res, updatedUser);
  },
];
