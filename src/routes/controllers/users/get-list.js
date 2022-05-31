import _ from 'lodash';
import Models from '~/models';
import ROLES from '~/routes/constants/roles';
import {
  joinLeft,
  where,
  count,
  paginate,
  select,
} from '../../utils/mongoose-query-helper';

import { USER_PUBLIC_KEY } from '~/routes/constants/schema';
import { queryBuilder } from '~/routes/utils';
import { successResponse } from '~/routes/utils/response';

/**
 * @param {Object} deps
 * @param {Models} deps.models
 */
export default ({ models, config }, authenticate) => [
  authenticate(ROLES.USERGROUP_GETLIST),
  async (req, res) => {
    const queryParams = queryBuilder(
      _.pick(req.query, [
        'active',
        'name',
        'firstName',
        'lastName',
        'email',
        'birthday',
        'address',
        'gender',
        'salutation',
        'avatar',
        'accountType',
        'phone',
      ]),
    );
    const query = [
      ...joinLeft(
        'user_groups',
        'userGroup',
        queryBuilder(req.query.userGroup),
        req.query.userGroup,
      ),
      ...where(queryParams),
    ];
    const data = await models.User.aggregate([
      ...query,
      ...select(USER_PUBLIC_KEY),
      ...paginate({
        pageSize: config.PAGE_SIZE,
        page: 1,
        sort: [],
        ...req.query.meta,
      }),
    ]);
    const total = await models.User.aggregate([...query, ...count()]);
    const meta = {
      paginate: {
        pageSize: config.PAGE_SIZE,
        page: '1',
        sort: [],
        ...req.query.meta,
        total: `${((total || [])[0] || {}).count || 0}`,
      },
    };
    return successResponse(res, data, meta);
  },
];
