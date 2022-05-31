import { param } from 'express-validator';
import _ from 'lodash';
import { isObjectId } from '~/models/util';
import errorMessages from '~/routes/constants/error-messages';
import { APPROVAL_STATUS, TEMPLATE_NAME } from '~/routes/constants/master-data';
import {
  badRequest,
  notFound,
  successResponse,
  errorResponseHandler,
} from '~/routes/utils/response';

export default ({ models, rejectHandler }, validator) => [
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
    if (approval.status !== APPROVAL_STATUS.PENDING) {
      return res.render(TEMPLATE_NAME.SUCESS, {
        message: errorMessages.APPROVAL_OUTDATE,
      });
    }

    const { type } = approval;

    const registerCustomerHandler = rejectHandler.factory(type);

    if (registerCustomerHandler.errors) {
      return res.render(TEMPLATE_NAME.ERR);
      // return errorResponseHandler(res, registerCustomerHandler.errors);
    }

    await registerCustomerHandler.run({ approval });
    return res.render(TEMPLATE_NAME.SUCESS, { message: 'Reject Successfully' });
    // return successResponse(res, approval);
  },
];
