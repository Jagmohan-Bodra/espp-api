import { param } from 'express-validator';
import { notFound, successResponse } from '../../utils/response';
import errorMessages from '~/routes/constants/error-messages';
import { isObjectId } from '~/routes/utils/validator';

export default ({ models }, validator) => [
  [
    param('contactId')
      .custom(isObjectId)
      .withMessage(errorMessages.CONTACT_ID_INVALID),
  ],
  validator,
  async (req, res) => {
    const contact = await models.Contact.findById(req.params.contactId).exec();

    if (!contact) {
      return notFound(res, errorMessages.CONTACT_NOT_FOUND);
    }

    await contact.deleteOne();

    return successResponse(res, contact);
  },
];
