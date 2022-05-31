import errorMessages from '~/routes/constants/error-messages';
import ROLES from '~/routes/constants/roles';
import { getObjectId } from '~/routes/utils';
import { getMembershipPrice } from '~/routes/utils/membership-product';
import { notFound, successResponse } from '~/routes/utils/response';

export default ({ models }, authenticate) => [
  authenticate(ROLES.CART_GETLIST),
  async (req, res) => {
    const { id } = req.context.tokenInfo;
    const customer = await models.Customer.findOne({
      user: getObjectId(id),
    }).exec();
    if (!customer) {
      return notFound(res, errorMessages.CUSTOMER_NOT_FOUND);
    }

    const cart = await models.Cart.find({ customer: customer._id }).exec();
    const results = await Promise.all(
      cart.map(async (item) => {
        const obj = item.toJSON();
        const [membershipPrice, moq] = await getMembershipPrice(
          { models },
          (obj.product || {})._id,
          (customer.membership || {})._id,
          (obj.product || {}).publicPrice,
        );
        obj.product = {
          ...obj.product,
          membershipPrice,
          moq: moq > 0 ? moq : obj.product && obj.product.moq,
        };
        return obj;
      }),
    );
    return successResponse(res, results);
  },
];
