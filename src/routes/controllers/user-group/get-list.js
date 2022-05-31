import _ from 'lodash';
import Models from '~/models';
import ROLES from '~/routes/constants/roles';

import { queryBuilder, paginateBuilder } from '~/routes/utils';
import { successResponse } from '~/routes/utils/response';

/**
 * @param {Object} deps
 * @param {Models} deps.models
 */
export default ({ models, config }, authenticate) => [
  authenticate(ROLES.USERGROUP_GETLIST),
  async (req, res) => {
    const query = queryBuilder(
      _.pick(req.query, ['name', 'description', 'active']),
    );
    const paginate = paginateBuilder({
      pageSize: config.PAGE_SIZE,
      page: 1,
      sort: [],
      ...req.query.meta,
    });
    const data = await models.UserGroup.find(query, null, paginate).exec();
    const meta = {
      paginate: {
        pageSize: config.PAGE_SIZE,
        page: '1',
        sort: [],
        ...req.query.meta,
        total: `${await models.UserGroup.count(query)}`,
      },
    };

    return successResponse(res, data, meta);
  },
];
