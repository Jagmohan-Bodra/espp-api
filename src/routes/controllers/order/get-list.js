import _ from 'lodash';
import Models from '~/models';
import ROLES from '~/routes/constants/roles';

import { ORDER_PUBLIC_KEY, USER_PUBLIC_KEY } from '~/routes/constants/schema';
import { queryBuilder, paginateBuilder } from '~/routes/utils';
import { successResponse } from '~/routes/utils/response';

/**
 * @param {Object} deps
 * @param {Models} deps.models
 */
export default ({ models, config }, authenticate) => [
  authenticate(ROLES.ORDER_GETLIST),
  async (req, res) => {
    let queryCustomer = {};
    if (req.query.user) {
      const queryParams = queryBuilder(_.pick(req.query.user, USER_PUBLIC_KEY));
      const users = await models.User.find(queryParams)
        .select('_id -userGroup')
        .exec();

      const queryUsers = queryBuilder({
        user: {
          in: users.map((userItem) => userItem._id),
        },
      });
      const customers = await models.Customer.find(queryUsers)
        .select('_id -user -membership')
        .exec();
      queryCustomer = {
        customer: {
          in: customers.map((customerItem) => customerItem._id),
        },
      };
    }

    const query = queryBuilder({
      ..._.pick(req.query, ORDER_PUBLIC_KEY),
      ...queryCustomer,
    });
    const paginate = paginateBuilder({
      pageSize: config.PAGE_SIZE,
      page: 1,
      sort: [],
      ...req.query.meta,
    });

    const data = await models.Order.find(query, null, paginate)
      .populate('promotions')
      .populate('customer')
      .populate('membership')
      .populate('orderProduct');

    const meta = {
      paginate: {
        pageSize: config.PAGE_SIZE,
        page: '1',
        sort: [],
        ...req.query.meta,
        total: `${await models.Order.count(query)}`,
      },
    };
    return successResponse(res, data, meta);
  },
];
