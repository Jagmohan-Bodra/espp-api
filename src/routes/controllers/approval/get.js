import { param } from 'express-validator';
import { isObjectId } from '~/models/util';
import errorMessages from '~/routes/constants/error-messages';
import { notFound, successResponse } from '~/routes/utils/response';

export default ({ models }, validator) => [
  [
    param('approvalId')
      .custom(isObjectId)
      .withMessage(errorMessages.APPROVAL_ID_INVALID),
  ],
  validator,
  async (req, res) => {
    const approval = await models.Approval.findById(
      req.params.approvalId,
    ).exec();

    if (!approval) {
      return notFound(res, errorMessages.APPROVAL_NOT_FOUND);
    }

    return successResponse(res, approval);
  },
];
