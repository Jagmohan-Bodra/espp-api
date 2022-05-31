import { notFound, successResponse } from '~/routes/utils/response';
import Models from '~/models';

const payloadSchema = [];

/**
 * @param {Object} deps
 * @param {Models} deps.models
 */
export default ({ models }, validator) => [
  payloadSchema,
  validator,
  async (req, res) => {
    const data = await models.Page.findOne({ url: req.body.url });

    if (!data) {
      return notFound(res);
    }

    return successResponse(res, data);
  },
];
