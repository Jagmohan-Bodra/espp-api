import { body } from 'express-validator';
import { notFound, badRequest, successResponse } from '~/routes/utils/response';
import errorMessages from '~/routes/constants/error-messages';
import { isObjectId } from '~/routes/utils/validator';
import { getObjectId } from '~/routes/utils';
import Models from '~/models';

/**
 * @param {Object} deps
 * @param {Models} deps.models
 */
export default ({ models }, validator) => [
  [
    body('productId')
      .custom(isObjectId)
      .withMessage(errorMessages.PRODUCT_ID_INVALID),
  ],
  validator,
  async (req, res) => {
    const { productId } = req.body;
    const product = await models.Product.findById(productId).exec();
    if (!product) {
      return notFound(res, errorMessages.PRODUCT_NOT_FOUND);
    }

    const { id } = req.context.tokenInfo;
    const customer = await models.Customer.findOne({
      user: getObjectId(id),
    }).exec();
    if (!customer) {
      return notFound(res, errorMessages.CUSTOMER_NOT_FOUND);
    }

    const existsWishlist = await models.Wishlist.findOne({
      product: product._id,
      customer: customer._id,
    }).exec();
    if (existsWishlist) {
      return successResponse(res);
    }

    const newWishlist = new models.Wishlist({
      product: product._id,
      customer: customer._id,
    });
    const errors = newWishlist.validateSync();
    if (errors) {
      return badRequest(res, errors.message);
    }

    await newWishlist.save();
    return successResponse(res, newWishlist);
  },
];
