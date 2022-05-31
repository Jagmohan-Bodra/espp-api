import _ from 'lodash';
import { badRequest, successResponse } from '~/routes/utils/response';

export default ({ models, config }, reCapchaAuth) => [
  reCapchaAuth({ config }),
  async (req, res) => {
    const params = _.pick(req.body, ['name', 'email', 'contactNo', 'message']);

    const newContact = new models.Contact(params);
    const errors = newContact.validateSync();

    if (errors) {
      return badRequest(res, errors.message);
    }

    await newContact.save();

    return successResponse(res, newContact);
  },
];
