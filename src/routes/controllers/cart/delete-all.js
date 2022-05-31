import errorMessages from '~/routes/constants/error-messages';
import ROLES from '~/routes/constants/roles';
import { getObjectId } from '~/routes/utils';
import { notFound, successResponse } from '~/routes/utils/response';

export default ({ models }, authenticate) => [
  authenticate(ROLES.CART_DELETE_ALL),
  async (req, res) => {
    const { id } = req.context.tokenInfo;
    const customer = await models.Customer.findOne({
      user: getObjectId(id),
    }).exec();
    if (!customer) {
      return notFound(res, errorMessages.CUSTOMER_NOT_FOUND);
    }

    const carts = await models.Cart.deleteMany({ customer: customer._id });

    return successResponse(res, carts);
  },
];
