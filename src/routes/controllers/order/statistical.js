import _ from 'lodash';
import Models from '~/models';
import { ORDERS_STATUS } from '~/routes/constants/master-data';

import { ORDER_PUBLIC_KEY } from '~/routes/constants/schema';
import { queryBuilder, paginateBuilder } from '~/routes/utils';
import { isThisMonth, isToDay, isYesterday } from '~/routes/utils/date';
import { successResponse } from '~/routes/utils/response';

const countByStatus = (data = [], status) =>
  data.reduce((count, item) => (item.status === status ? count + 1 : count), 0);
const countByCondition = (data = [], condfunc) =>
  data.reduce((count, item) => (condfunc(item) ? count + 1 : count), 0);

/**
 * @param {Object} deps
 * @param {Models} deps.models
 */
export default ({ models }) => [
  async (req, res) => {
    const query = queryBuilder({
      ..._.pick(req.query, ORDER_PUBLIC_KEY),
    });
    const paginate = paginateBuilder({
      page: 1,
      sort: [],
      ...req.query.meta,
    });

    const data = await models.Order.find(query, null, paginate);
    const results = {
      [ORDERS_STATUS.CANCELLED]: countByStatus(data, ORDERS_STATUS.CANCELLED),
      [ORDERS_STATUS.PENDING]: countByStatus(data, ORDERS_STATUS.PENDING),
      [ORDERS_STATUS.PROCESSING]: countByStatus(data, ORDERS_STATUS.PROCESSING),
      [ORDERS_STATUS.READY_TO_SHIP]: countByStatus(
        data,
        ORDERS_STATUS.READY_TO_SHIP,
      ),
      [ORDERS_STATUS.COMPLETED]: countByStatus(data, ORDERS_STATUS.COMPLETED),
      today: countByCondition(data, (item) => isToDay(item.createdAt)),
      today_pending: countByCondition(
        data,
        (item) =>
          isToDay(item.createdAt) && item.status == ORDERS_STATUS.PENDING,
      ),
      yesterday: countByCondition(data, (item) => isYesterday(item.createdAt)),
      yesterday_pending: countByCondition(
        data,
        (item) =>
          isYesterday(item.createdAt) && item.status == ORDERS_STATUS.PENDING,
      ),
      this_month: countByCondition(data, (item) => isThisMonth(item.createdAt)),
      this_month_completed: countByCondition(
        data,
        (item) =>
          isThisMonth(item.createdAt) && item.status == ORDERS_STATUS.COMPLETED,
      ),
    };

    return successResponse(res, results);
  },
];
