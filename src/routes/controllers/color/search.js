import _ from 'lodash';
import Models from '~/models';
import { paginateBuilder, queryBuilder } from '~/routes/utils';
import { successResponse } from '~/routes/utils/response';

const counter = async (models, code) => {
  if (code === undefined || code === null) {
    return 0;
  }

  const color = await models.Color.findOne({ code }).exec();
  if (!color) {
    return 0;
  }
  const products = await models.Product.find({
    colors: { $in: color._id },
  });
  return products.length;
};

const countProducts = async (models, colors) =>
  Promise.all(
    colors.map(async (color) => ({
      ...color.toJSON(),
      productCount: await counter(models, color.code),
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

    const colors = await models.Color.find(query, null, paginate).exec();

    const meta = {
      paginate: {
        pageSize: config.PAGE_SIZE,
        page: '1',
        sort: [],
        ...req.query.meta,
        total: `${await models.Color.count(query)}`,
      },
    };
    const colorsMapped = await countProducts(models, colors);

    return successResponse(res, colorsMapped, meta);
  },
];
