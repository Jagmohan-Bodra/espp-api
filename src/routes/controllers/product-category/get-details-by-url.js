import { param } from 'express-validator';
import { notFound, successResponse } from '~/routes/utils/response';
import Models from '~/models';
import errorMessages from '~/routes/constants/error-messages';

/**
 * @param {Object} deps
 * @param {Models} deps.models
 */
export default ({ models }, validator) => [
  [param('url')],
  validator,
  async (req, res) => {
    const model = await models.ProductCategory.findOne({
      url: req.params.url,
    });

    if (!model) {
      return notFound(res, errorMessages.DATA_NOT_FOUND);
    }

    return successResponse(res, model);
  },
];
