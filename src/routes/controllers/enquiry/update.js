import { param } from 'express-validator';
import _ from 'lodash';
import { badRequest, notFound, successResponse } from '../../utils/response';
import { isObjectId } from '~/routes/utils/validator';
import errorMessages from '~/routes/constants/error-messages';
import Models from '~/models';
import { mongooseErrMessageHelper } from '~/routes/utils';
import ROLES from '~/routes/constants/roles';

const updateSchema = [
  param('enquiryId').custom(isObjectId).withMessage(errorMessages.ID_INVALID),
];

/**
 * @param {Object} deps
 * @param {Models} deps.models
 */
export default ({ models }, authenticate, validator) => [
  authenticate(ROLES.ENQUIRY_UPDATE),
  updateSchema,
  validator,
  async (req, res) => {
    const currentEnquiry = await models.Enquiry.findById(req.params.enquiryId);

    if (!currentEnquiry) {
      return notFound(res, errorMessages.DATA_NOT_FOUND);
    }

    currentEnquiry.set(_.pick(req.body, ['status', 'reason']));

    const errors = currentEnquiry.validateSync();
    if (errors) {
      return badRequest(res, errors.message);
    }

    const updatedEnquiry = await currentEnquiry.save().catch((err) => err);
    if (updatedEnquiry instanceof Error) {
      return badRequest(res, mongooseErrMessageHelper(updatedEnquiry));
    }
    return successResponse(res, updatedEnquiry);
  },
];
