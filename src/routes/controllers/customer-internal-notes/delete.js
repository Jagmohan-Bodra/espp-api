import { param } from 'express-validator';
import { notFound, successResponse } from '~/routes/utils/response';
import { isObjectId } from '~/routes/utils/validator';
import errorMessages from '~/routes/constants/error-messages';
import Models from '~/models';
import ROLES from '~/routes/constants/roles';

const deleteSchema = [
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
  authenticate(ROLES.CUSTOMER_INTERNALNOTE_DELETE),
  deleteSchema,
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

    const customer = await models.Customer.findById(
      req.params.customerId,
    ).exec();
    if (!customer) {
      return notFound(res, errorMessages.CUSTOMER_NOT_FOUND);
    }

    const internalNotes = [...(customer.internalNote || [])];
    const index = internalNotes.findIndex(
      (note) => note.toHexString() === req.params.internalNoteId,
    );
    if (index !== -1) {
      internalNotes.splice(index, 1);
    }

    await customer.set({ ...customer, internalNote: internalNotes }).save();

    await internalNote.deleteOne();

    return successResponse(res, internalNote);
  },
];
