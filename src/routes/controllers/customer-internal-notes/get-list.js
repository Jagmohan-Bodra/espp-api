import _ from 'lodash';
import { param } from 'express-validator';
import Models from '~/models';
import { queryBuilder, paginateBuilder } from '~/routes/utils';
import { successResponse } from '~/routes/utils/response';
import errorMessages from '~/routes/constants/error-messages';
import { isObjectId } from '~/models/util';
import ROLES from '~/routes/constants/roles';

/**
 * @param {Object} deps
 * @param {Models} deps.models
 */
export default ({ models, config }, authenticate, validator) => [
  authenticate(ROLES.CUSTOMER_INTERNALNOTE_GETLIST),
  [
    param('customerId')
      .custom(isObjectId)
      .withMessage(errorMessages.CUSTOMER_ID_INVALID),
  ],
  validator,
  async (req, res) => {
    const query = queryBuilder({
      ..._.pick(req.query, ['_id', 'sendDate', 'message', 'publish']),
      customer: { objectId: req.params.customerId },
    });

    const paginate = paginateBuilder({
      pageSize: config.PAGE_SIZE,
      page: 1,
      sort: [],
      ...req.query.meta,
    });

    const data = await models.InternalNote.find(query, null, paginate).exec();
    const meta = {
      paginate: {
        pageSize: config.PAGE_SIZE,
        page: '1',
        sort: [],
        ...req.query.meta,
        total: `${await models.InternalNote.count(query)}`,
      },
    };
    return successResponse(res, data, meta);
  },
];
