import _ from 'lodash';
import Models from '~/models';
import { paginateBuilder, queryBuilder } from '~/routes/utils';
import { successResponse } from '~/routes/utils/response';

/**
 * @param {Object} deps
 * @param {Models} deps.models
 */
export default ({ models, config }) => async (req, res) => {
  const query = queryBuilder(
    _.pick(req.query, [
      'name',
      'email',
      'contactNo',
      'message',
      'createdAt',
      'readAt',
      'readBy',
    ]),
  );

  const paginate = paginateBuilder({
    pageSize: config.PAGE_SIZE,
    page: 1,
    ...(req.query.meta || {}),
  });

  const contacts = await models.Contact.find(query, null, paginate).exec();
  const meta = {
    paginate: {
      pageSize: config.PAGE_SIZE,
      page: '1',
      sort: [],
      ...req.query.meta,
      total: `${await models.Contact.count(query)}`,
    },
  };
  return successResponse(res, contacts, meta);
};
