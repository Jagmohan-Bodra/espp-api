import _ from 'lodash';
import NotificationHandler from '~/handlers/notification';
import Models from '~/models';
import { ENQUIRY_STATUS } from '~/routes/constants/master-data';
import { mongooseErrMessageHelper } from '~/routes/utils';
import { badRequest, notFound, successResponse } from '~/routes/utils/response';

/**
 * @param {Object} deps
 * @param {Models} deps.models
 */
export default ({ models, config, notificationHandler }, reCapchaAuth) => [
  reCapchaAuth({ config }),
  async (req, res) => {
    const data = new models.Enquiry(
      _.pick(req.body, [
        'name',
        'email',
        'contact',
        'product',
        'message',
        'internalNote',
      ]),
    );
    data.status = ENQUIRY_STATUS.OPEN;

    const errors = data.validateSync();
    if (errors) {
      return badRequest(res, errors.message);
    }

    if (req.body.product) {
      const currentProduct = await models.Product.findById(
        req.body.product,
      ).exec();
      if (!currentProduct) {
        return notFound(res);
      }
    }

    await data.save().catch((err) => err);
    if (data instanceof Error) {
      return badRequest(res, mongooseErrMessageHelper(data));
    }

    const { CONTACT_US } = NotificationHandler.type;
    await notificationHandler.publish(CONTACT_US, { data });

    return successResponse(res, data);
  },
];
