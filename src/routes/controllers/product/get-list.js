import _ from 'lodash';
import { BASE_URL } from '~/config';
import Models from '~/models';
import errorMessages from '~/routes/constants/error-messages';

import { getObjectId, queryBuilder } from '~/routes/utils';
import { getChildProductCategories } from '~/routes/utils/model-cache';
import {
  joinLeft,
  joinLefts,
  paginate,
  where,
  select,
  count,
  joinLeftModel,
} from '~/routes/utils/mongoose-query-helper';
import { notFound, successResponse } from '~/routes/utils/response';

/**
 * @param {Object} deps
 * @param {Models} deps.models
 */
export default ({ models, cache, config }) => async (req, res) => {
  const { id } = req.context.tokenInfo;
  const customer = await models.Customer.findOne({
    user: getObjectId(id),
  }).exec();
  // if (!customer) {
  //   return notFound(res, errorMessages.CUSTOMER_NOT_FOUND);
  // }
  const membershipId = ((customer || {}).membership || {})._id;
  const queryParams = queryBuilder(
    _.pick(req.query, [
      '_id',
      'quantity',
      'moq',
      'view',
      'sold',
      'name',
      'sku',
      'description',
      'unit',
      'size',
      'typeAndMaterial',
      'uom',
      'itemPackingSize',
      'qtyPerCtn',
      'images',
      'taxApply',
      'status',
      'content',
      'styles',
      'published',
      // 'productCategories._id',
      'brands._id',
      'colors._id',
      'tags._id',
      'publicPrice',
      'seoProps',
      'barcode',
    ]),
  );

  if ((req.query['productCategories._id'] || {}).objectId) {
    const categories = await getChildProductCategories(
      { cache, models },
      req.query['productCategories._id'].objectId,
    );
    if (categories) {
      queryParams['productCategories._id'] = {
        $in: categories.map((item) => getObjectId(item)),
      };
    }
  }

  const query = [
    ...joinLefts(
      'product_categories',
      'productCategories',
      queryBuilder(req.query.productCategories),
    ),
    ...joinLefts('brands', 'brands', queryBuilder(req.query.brands)),
    ...joinLefts('colors', 'colors', queryBuilder(req.query.colors)),
    ...joinLefts('tags', 'tags', queryBuilder(req.query.tags)),
    ...joinLeftModel(
      'membership_products',
      'membershipProducts',
      queryBuilder(req.query.membershipProducts),
      [],
      '$product',
    ),
    {
      $lookup: {
        from: 'memberships',
        pipeline: [{ $match: {} }],
        as: 'memberships',
      },
    },
    ...where(queryParams),
  ];
  const data = await models.Product.aggregate([
    ...query,
    ...select([
      '_id',
      'images',
      'status',
      'productCategories',
      'membershipProducts',
      'brands',
      'colors',
      'tags',
      'name',
      'url',
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
      'published',
      'quantity',
      'moq',
      'view',
      'sold',
      'barcode',
      'pushlish',
      'createdAt',
      'updatedAt',
      'memberships',
      'inventoryThreshold',
      'imagePaths',
      'imageFullPaths',
    ]),
    ...paginate({
      pageSize: config.PAGE_SIZE,
      page: 1,
      sort: [],
      ...req.query.meta,
    }),
  ]);
  const total = await models.Product.aggregate([...query, ...count()]);
  const meta = {
    paginate: {
      pageSize: config.PAGE_SIZE,
      page: '1',
      sort: [],
      ...req.query.meta,
      total: `${((total || [])[0] || {}).count || 0}`,
    },
  };
  // const paginate = paginateBuilder({
  //   pageSize: config.PAGE_SIZE,
  //   page: 1,
  //   ...(req.query.meta || {}),
  // });

  // const model = await models.Product.find(query, null, paginate).exec();
  // const meta = {
  //   paginate: {
  //     pageSize: config.PAGE_SIZE,
  //     page: '1',
  //     sort: [],
  //     ...req.query.meta,
  //     total: `${await models.Product.count(query)}`,
  //   },
  // };

  const result = data.map((item) => {
    let membershipPrice = item.publicPrice;
    if (membershipId) {
      const membershipProductsItem = (item.membershipProducts || []).find(
        (membershipProduct) =>
          membershipProduct.membership.toString() == membershipId.toString(),
      );

      if (membershipProductsItem) {
        membershipPrice = membershipProductsItem.price;
      }

      if (!membershipProductsItem) {
        const membershipItem = (item.memberships || []).find(
          (membership) => membership._id.toString() == membershipId.toString(),
        );
        if (membershipItem) {
          membershipPrice = Number(
            (
              (item.publicPrice * (100 - membershipItem.discountPercent)) /
              100
            ).toFixed(6),
          );
        }
      }
    }
    delete item.memberships;
    delete item.membershipProducts;
    return {
      ...item,
      membershipPrice,
      imageFullPaths: (item.imagePaths || []).map(
        (path) => `${BASE_URL}${path}`,
      ),
    };
  });
  return successResponse(res, result, meta);
};
