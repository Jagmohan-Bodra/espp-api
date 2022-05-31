import { param } from 'express-validator';
import { isObjectId } from '~/routes/utils/validator';
import { notFound, successResponse } from '~/routes/utils/response';
import errorMessages from '~/routes/constants/error-messages';
import Models from '~/models';
import ROLES from '~/routes/constants/roles';

const schema = [
  param('customerId')
    .custom(isObjectId)
    .withMessage(errorMessages.CUSTOMER_ID_INVALID),
  param('internalNoteId')
    .custom(isObjectId)
    .withMessage(errorMessages.INTENAL_NOTE_NOT_FOUND),
];

/**
 * @param {Object} deps
 * @param {Models} deps.models
 */
export default ({ models }, authenticate, validator) => [
  authenticate(ROLES.CUSTOMER_INTERNALNOTE_GET),
  schema,
  validator,
  async (req, res) => {
    const internalNote = await models.InternalNote.findById(
      req.params.internalNoteId,
    ).exec();
    if (!internalNote) {
      return notFound(res, errorMessages.INTENAL_NOTE_NOT_FOUND);
    }

    if (internalNote.customer._id.toHexString() !== req.params.customerId) {
      return notFound(res, errorMessages.CUSTOMER_WRONG);
    }

    return successResponse(res, internalNote);
  },
];
