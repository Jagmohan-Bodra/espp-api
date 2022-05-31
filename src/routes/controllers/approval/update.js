import { param } from 'express-validator';
import { isObjectId } from '~/models/util';
import errorMessages from '~/routes/constants/error-messages';
import { badRequest, notFound, successResponse } from '~/routes/utils/response';

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

    approval.set({ status: req.body.status });
    const errors = approval.validateSync();

    if (errors) {
      return badRequest(res, errors.message);
    }

    await approval.save();

    return successResponse(res, approval);
  },
];
