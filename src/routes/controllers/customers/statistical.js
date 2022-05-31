import _ from 'lodash';
import Models from '~/models';
import { CUSTOMER_STATUS } from '~/routes/constants/master-data';

import {
  CUSTOMER_PUBLIC_KEY,
  ORDER_PUBLIC_KEY,
} from '~/routes/constants/schema';
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
      ..._.pick(req.query, CUSTOMER_PUBLIC_KEY),
    });
    const paginate = paginateBuilder({
      page: 1,
      sort: [],
      ...req.query.meta,
    });

    const data = await models.Customer.find(query, null, paginate);

    const results = {
      [CUSTOMER_STATUS.PENDING]: countByStatus(data, CUSTOMER_STATUS.PENDING),
      [CUSTOMER_STATUS.ACTIVE]: countByStatus(data, CUSTOMER_STATUS.ACTIVE),
      [CUSTOMER_STATUS.SUSPEND]: countByStatus(data, CUSTOMER_STATUS.SUSPEND),
      total: countByCondition(data, () => true),
      this_month: countByCondition(data, (item) => isThisMonth(item.createdAt)),
      total_actice: countByCondition(
        data,
        (item) => item.status == CUSTOMER_STATUS.ACTIVE,
      ),
      total_subpended: countByCondition(
        data,
        (item) => item.status == CUSTOMER_STATUS.SUSPEND,
      ),
    };
    return successResponse(res, results);
  },
];
