import _ from 'lodash';
import Models from '~/models';
import { queryBuilder } from '~/routes/utils';
import { successResponse } from '~/routes/utils/response';

/**
 * @param {Object} deps
 * @param {Models} deps.models
 */
export default ({ models }) => [
  async (req, res) => {
    const query = queryBuilder({
      ..._.pick(req.query),
    });
    const results = {
      count: await models.Product.count(query),
    };

    return successResponse(res, results);
  },
];
