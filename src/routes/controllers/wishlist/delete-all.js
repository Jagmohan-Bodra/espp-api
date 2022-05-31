import errorMessages from '~/routes/constants/error-messages';
import { getObjectId } from '~/routes/utils';
import { notFound, successResponse } from '~/routes/utils/response';

export default ({ models }) => [
  async (req, res) => {
    const { id } = req.context.tokenInfo;
    const customer = await models.Customer.findOne({
      user: getObjectId(id),
    }).exec();
    if (!customer) {
      return notFound(res, errorMessages.CUSTOMER_NOT_FOUND);
    }

    const wishlists = await models.Wishlist.deleteMany({
      customer: customer._id,
    });

    return successResponse(res, wishlists);
  },
];
