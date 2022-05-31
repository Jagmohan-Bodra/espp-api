import _ from 'lodash';
import Models from '~/models';
import { SETTING_PUBLIC_KEY } from '~/routes/constants/schema';
import { queryBuilder, paginateBuilder } from '~/routes/utils';
import { successResponse } from '~/routes/utils/response';

/**
 * @param {Object} deps
 * @param {Models} deps.models
 */
export default ({ models, config }) => [
  async (req, res) => {
    const query = queryBuilder(
      _.pick(req.query, [
        'key',
        'inputType',
        'module',
        'group',
        'label',
        'hint',
      ]),
    );
    const paginate = paginateBuilder({
      pageSize: config.PAGE_SIZE,
      page: 1,
      sort: [],
      ...req.query.meta,
    });

    const data = await models.Setting.find(query, null, paginate).exec();
    const meta = {
      paginate: {
        pageSize: config.PAGE_SIZE,
        page: '1',
        sort: [],
        ...req.query.meta,
        total: `${await models.Setting.count(query)}`,
      },
    };
    const results = data.map((item) => _.pick(item, SETTING_PUBLIC_KEY));

    return successResponse(res, results, meta);
  },
];
