import { param } from 'express-validator';
import _ from 'lodash';
import { badRequest, notFound, successResponse } from '../../utils/response';
import { isObjectId } from '~/routes/utils/validator';
import errorMessages from '~/routes/constants/error-messages';
import Models from '~/models';
import { mongooseErrMessageHelper } from '~/routes/utils';
import ROLES from '~/routes/constants/roles';

const updateSchema = [
  param('membershipId')
    .optional()
    .custom(isObjectId)
    .withMessage(errorMessages.MEMBERSHIP_ID_INVALID),
];

/**
 * @param {Object} deps
 * @param {Models} deps.models
 */
export default ({ models }, authenticate, validator) => [
  authenticate(ROLES.MEMBERSHIP_UPDATE),
  updateSchema,
  validator,
  async (req, res) => {
    const currentMembership = await models.Membership.findById(
      req.params.membershipId,
    );

    if (!currentMembership) {
      return notFound(res, errorMessages.MEMBERSHIP_NOT_FOUND);
    }

    currentMembership.set(
      _.pick(req.body, ['name', 'description', 'discountPercent', 'isDefault']),
    );

    const errors = currentMembership.validateSync();
    if (errors) {
      return badRequest(res, errors.message);
    }

    const updatedMembership = await currentMembership
      .save()
      .then(async (data) => {
        if (data.isDefault) {
          await models.Membership.updateMany(
            {
              _id: {
                $ne: data._id,
              },
            },
            {
              $set: {
                isDefault: false,
              },
            },
          );
        }
        return data;
      })
      .catch((err) => err);
    if (updatedMembership instanceof Error) {
      return badRequest(res, mongooseErrMessageHelper(updatedMembership));
    }
    return successResponse(res, updatedMembership);
  },
];
