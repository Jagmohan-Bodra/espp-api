import _ from 'lodash';
import Models from '~/models';
import ROLES from '~/routes/constants/roles';

import { paginateBuilder, queryBuilder } from '~/routes/utils';
import { successResponse } from '~/routes/utils/response';

const counter = async (models, code) => {
  if (code === undefined || code === null) {
    return 0;
  }

  const brand = await models.Brand.findOne({ code }).exec();
  if (!brand) {
    return 0;
  }
  const products = await models.Product.find({
    brands: { $in: brand._id },
  });
  return products.length;
};

const countProducts = async (models, brands) =>
  Promise.all(
    brands.map(async (brand) => ({
      ...brand.toJSON(),
      productCount: await counter(models, brand.code),
    })),
  );

/**
 * @param {Object} deps
 * @param {Models} deps.models
 */
export default ({ models, config }, authenticate) => [
  authenticate(ROLES.BRAND_GETLIST),
  async (req, res) => {
    const query = queryBuilder(
      _.pick(req.query, [
        'name',
        'code',
        'image',
        'description',
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

    const brands = await models.Brand.find(query, null, paginate).exec();
    const meta = {
      paginate: {
        pageSize: config.PAGE_SIZE,
        page: '1',
        sort: [],
        ...req.query.meta,
        total: `${await models.Brand.count(query)}`,
      },
    };

    const brandsMapped = await countProducts(models, brands);

    return successResponse(res, brandsMapped, meta);
  },
];
