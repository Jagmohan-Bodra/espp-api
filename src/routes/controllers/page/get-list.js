import _ from 'lodash';
import Models from '~/models';
import { queryBuilder } from '~/routes/utils';
import { successResponse } from '~/routes/utils/response';
import {
  joinLeft,
  where,
  count,
  paginate,
  notSelect,
} from '../../utils/mongoose-query-helper';

/**
 * @param {Object} deps
 * @param {Models} deps.models
 */
export default ({ models, config }) => [
  async (req, res) => {
    const queryParams = queryBuilder(
      _.pick(req.query, [
        'name',
        'description',
        'url',
        'pushlish',
        'site',
        'type',
      ]),
    );
    const query = [
      ...joinLeft(
        'themes',
        'theme',
        queryBuilder(req.query.theme),
        req.query.theme,
      ),
      ...where(queryParams),
    ];

    const data = await models.Page.aggregate([
      ...query,
      ...notSelect(['content', 'styles', 'theme.content', 'theme.styles']),
      ...paginate({
        pageSize: config.PAGE_SIZE,
        page: 1,
        sort: [],
        ...req.query.meta,
      }),
    ]);
    const total = await models.Page.aggregate([...query, ...count()]);
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
