import { param } from 'express-validator';
import { notFound, successResponse } from '~/routes/utils/response';
import { getCustomerHelper } from '~/routes/utils/auth';
import Models from '~/models';
import errorMessages from '~/routes/constants/error-messages';
import { getMembershipPrice } from '~/routes/utils/membership-product';

/**
 * @param {Object} deps
 * @param {Models} deps.models
 */
export default ({ models, jwt }, validator) => [
  [param('url')],
  validator,
  async (req, res) => {
    const model = await models.Product.findOne({
      url: req.params.url,
    });
    if (!model) {
      return notFound(res, errorMessages.PRODUCT_NOT_FOUND);
    }
    const result = model.toJSON();
    const customer = await getCustomerHelper({ models, jwt }, req);

    if (customer) {
      const [membershipPrice, moq] = await getMembershipPrice(
        { models },
        model._id,
        customer.membership._id,
        model.publicPrice,
      );
      result.membershipPrice = membershipPrice;
      result.moq = moq > 0 ? moq : result.moq;
    }

    return successResponse(res, result);
  },
];
