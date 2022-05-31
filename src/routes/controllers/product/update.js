import _ from 'lodash';
import { param } from 'express-validator';
import { badRequest, notFound, successResponse } from '~/routes/utils/response';
import {
  getObjectId,
  isValid,
  makeUrlFriendly,
  mongooseErrMessageHelper,
} from '~/routes/utils';
import Models from '~/models';
import errorMessages from '~/routes/constants/error-messages';
import ROLES from '~/routes/constants/roles';

/**
 * @param {Object} deps
 * @param {Models} deps.models
 */
export default ({ models }, authenticate, validator) => [
  authenticate(ROLES.PRODUCT_UPDATE),
  [param('id').custom(isValid).withMessage('"id" must be a objectId value')],
  validator,
  async (req, res) => {
    const params = _.pick(req.body, [
      'quantity',
      'moq',
      'view',
      'sold',
      'name',
      'sku',
      'description',
      'publicPrice',
      'unit',
      'size',
      'typeAndMaterial',
      'uom',
      'itemPackingSize',
      'qtyPerCtn',
      'taxApply',
      'status',
      'content',
      'styles',
      'published',
      'seoProps',
      'images',
      'productCategories',
      'brands',
      'colors',
      'tags',
      'barcode',
      'inventoryThreshold',
      'imagePaths',
    ]);

    const product = await models.Product.findOne({
      _id: getObjectId(req.params.id),
    });
    if (!product) {
      return notFound(res, errorMessages.PRODUCT_NOT_FOUND);
    }
    if (params.name) {
      params.url = makeUrlFriendly(params.name);
    }
    product.set(params);
    const errors = product.validateSync();
    if (errors) {
      return badRequest(res, errors.message);
    }

    const productData = await product.save().catch((err) => err);
    if (productData instanceof Error) {
      return badRequest(res, mongooseErrMessageHelper(productData));
    }
    return successResponse(res, product);
  },
];
