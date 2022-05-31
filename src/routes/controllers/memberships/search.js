import _ from 'lodash';
import Models from '~/models';
import { MEMBERSHIP_PUBLIC_KEY } from '~/routes/constants/schema';
import { queryBuilder, paginateBuilder } from '~/routes/utils';
import { successResponse } from '~/routes/utils/response';

/**
 * @param {Object} deps
 * @param {Models} deps.models
 */
export default ({ models, config }) => [
  async (req, res) => {
    const query = queryBuilder(_.pick(req.query, MEMBERSHIP_PUBLIC_KEY));
    const paginate = paginateBuilder({
      pageSize: config.PAGE_SIZE,
      page: 1,
      sort: [],
      ...req.query.meta,
    });

    const data = await models.Membership.find(query, null, paginate).exec();
    const meta = {
      paginate: {
        pageSize: config.PAGE_SIZE,
        page: '1',
        sort: [],
        ...req.query.meta,
        total: `${await models.Membership.count(query)}`,
      },
    };
    return successResponse(res, data, meta);
  },
];
