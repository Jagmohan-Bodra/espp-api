import _ from 'lodash';
import Models from '~/models';
import { paginateBuilder, queryBuilder } from '~/routes/utils';
import { successResponse } from '~/routes/utils/response';

const counter = async (models, code) => {
  if (code === undefined || code === null) {
    return 0;
  }

  const productCategory = await models.ProductCategory.findOne({ code }).exec();
  if (!productCategory) {
    return 0;
  }
  const products = await models.Product.find({
    productCategories: { $in: productCategory._id },
  });
  return products.length;
};

const countProducts = async (models, categories) =>
  Promise.all(
    categories.map(async (category) => ({
      ...category.toJSON(),
      productCount: await counter(models, category.code),
    })),
  );

/**
 * @param {Object} deps
 * @param {Models} deps.models
 */
export default ({ models, config }) => [
  async (req, res) => {
    const query = queryBuilder(
      _.pick(req.query, [
        'name',
        'code',
        'image',
        'description',
        'parent',
        'seoProps',
        'status',
      ]),
    );

    const paginate = paginateBuilder({
      pageSize: config.PAGE_SIZE,
      page: 1,
      sort: [],
      ...req.query.meta,
    });

    const productCategories = await models.ProductCategory.find(
      query,
      null,
      paginate,
    ).exec();

    const meta = {
      paginate: {
        pageSize: config.PAGE_SIZE,
        page: '1',
        sort: [],
        ...req.query.meta,
        total: `${await models.ProductCategory.count(query)}`,
      },
    };

    const productCategoriesMapped = await countProducts(
      models,
      productCategories,
    );

    return successResponse(res, productCategoriesMapped, meta);
  },
];
