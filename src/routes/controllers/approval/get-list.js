import { param } from 'express-validator';
import _ from 'lodash';
import Models from '~/models';
import { isObjectId } from '~/models/util';
import errorMessages from '~/routes/constants/error-messages';
import { queryBuilder, paginateBuilder } from '~/routes/utils';
import { successResponse } from '~/routes/utils/response';

/**
 * @param {Object} deps
 * @param {Models} deps.models
 */

export default ({ models, config }) => [
  async (req, res) => {
    const query = queryBuilder(
      _.pick(req.query, ['type', 'status', 'customer']),
    );
    const paginate = paginateBuilder({
      pageSize: config.PAGE_SIZE,
      page: 1,
      sort: [],
      ...req.query.meta,
    });

    const data = await models.Approval.find(query, null, paginate).exec();
    const meta = {
      paginate: {
        pageSize: config.PAGE_SIZE,
        page: '1',
        sort: [],
        ...req.query.meta,
        total: `${await models.Approval.count(query)}`,
      },
    };
    return successResponse(res, data, meta);
  },
];
