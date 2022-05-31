import { param } from 'express-validator';
import Models from '~/models';
import errorMessages from '~/routes/constants/error-messages';
import { APPROVAL_STATUS } from '~/routes/constants/master-data';
import ROLES from '~/routes/constants/roles';
import { badRequest, notFound, successResponse } from '~/routes/utils/response';
import { isObjectId } from '~/routes/utils/validator';

const rules = [
  param('approvalId')
    .custom(isObjectId)
    .withMessage(errorMessages.APPROVAL_ID_INVALID),
];

/**
 * @param {Object} deps
 * @param {Models} deps.models
 */
export default ({ models }, validator) => [
  rules,
  validator,
  async (req, res) => {
    const approval = await models.Approval.findById(
      req.params.approvalId,
    ).exec();

    if (!approval) {
      return notFound(res, errorMessages.APPROVAL_NOT_FOUND);
    }

    if (approval.status === APPROVAL_STATUS.PENDING) {
      return badRequest(res, errorMessages.CANNOT_DELETE_PENDING_APPROVAL);
    }

    await approval.deleteOne();

    return successResponse(res, approval);
  },
];
