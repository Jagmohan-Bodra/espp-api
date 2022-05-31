import _ from 'lodash';
import { body } from 'express-validator';
import Models from '~/models';
import { badRequest, successResponse } from '~/routes/utils/response';
import errorMessages from '~/routes/constants/error-messages';
import { makeUrlFriendly, mongooseErrMessageHelper } from '~/routes/utils';
import ROLES from '~/routes/constants/roles';

const createRules = [
  body('productCategories')
    .optional()
    .isArray()
    .withMessage(errorMessages.PRODUCT_CATEGORIES_INVALID),
  body('brands').optional().isArray().withMessage(errorMessages.BRANDS_INVALID),
  body('colors').optional().isArray().withMessage(errorMessages.COLORS_INVALID),
  body('tags').optional().isArray().withMessage(errorMessages.TAGS_INVALID),
  body('images').optional().isArray().withMessage(errorMessages.IMAGES_INVALID),
  body('imagePaths')
    .optional()
    .isArray()
    .withMessage(errorMessages.IMAGES_INVALID),
];
/**
 * @param {Object} deps
 * @param {Models} deps.models
 */
export default ({ models }, authenticate, validator) => [
  authenticate(ROLES.PRODUCT_CREATE),
  createRules,
  validator,
  async (req, res) => {
    const params = _.pick(req.body, [
      'productCategories',
      'brands',
      'colors',
      'tags',
      'images',
      'name',
      'sku',
      'description',
      'publicPrice',
      'unit',
      'size',
      'quantity',
      'view',
      'sold',
      'moq',
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
      'barcode',
      'inventoryThreshold',
      'imagePaths',
    ]);

    const newProduct = new models.Product({
      ...params,
      url: makeUrlFriendly(params.name),
    });
    const errors = newProduct.validateSync();
    if (errors) {
      return badRequest(res, errors.message);
    }

    const productData = await newProduct.save().catch((err) => err);
    if (productData instanceof Error) {
      return badRequest(res, mongooseErrMessageHelper(productData));
    }

    return successResponse(res, productData);
  },
];
