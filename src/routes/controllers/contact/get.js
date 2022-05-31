import { param } from 'express-validator';
import moment from 'moment';
import { notFound, successResponse } from '~/routes/utils/response';
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

    const readBy = req.context.tokenInfo.id;
    const readAt = moment().format();
    await contact.set({ readBy, readAt }).save();

    return successResponse(res, contact);
  },
];
