import _ from 'lodash';
import moment from 'moment';
import { param } from 'express-validator';
import { isValid } from '../../utils';
import Models from '~/models';
import { badRequest, successResponse, notFound } from '~/routes/utils/response';
import errorMessages from '~/routes/constants/error-messages';

/**
 * @param {Object} deps
 * @param {Models} deps.models
 */
export default ({ models }, validator) => [
  [param('enquiryId').custom(isValid).withMessage(errorMessages.ID_INVALID)],
  validator,
  async (req, res) => {
    const enquiry = await models.Enquiry.findById(req.params.enquiryId).exec();
    if (!enquiry) {
      return notFound(res, errorMessages.DATA_NOT_FOUND);
    }

    const data = new models.EnquiryInternalNote({
      user: req.context.tokenInfo.id,
      sendDate: moment().format(),
      message: req.body.message,
      publish: true,
      enquiry: req.params.enquiryId,
    });

    const errors = data.validateSync();
    if (errors) {
      return badRequest(res, errors.message);
    }
    await data.save();

    enquiry.set({
      internalNote: [...enquiry.internalNote, data._id],
    });
    await enquiry.save();

    return successResponse(res, data);
  },
];
