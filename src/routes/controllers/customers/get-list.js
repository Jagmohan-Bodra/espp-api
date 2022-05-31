import _ from 'lodash';
import { queryBuilder } from '~/routes/utils';
import { successResponse } from '~/routes/utils/response';
import Models from '~/models';
import ROLES from '~/routes/constants/roles';
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
export default ({ models, config }, authenticate) => [
  authenticate(ROLES.CUSTOMER_GETLIST),
  async (req, res) => {
    const queryParams = queryBuilder({
      ..._.pick(req.query, [
        '_id',
        'customerCode',
        'personalContact',
        'salesExecutive',
        'creditTerms',
        'currency',
        'accountType',
        'remark',
        'designation',
        'contactNo',
        'personalEmail',
        'status',
        'addressBlockNo',
        'addressStresstName',
        'addressFloor',
        'addressUnitNo',
        'addressBuildingName',
        'addressPostCode',
        'addressCity',
        'addressState',
        'addressCountry',
        'financeSalutation',
        'financeFirstName',
        'financeLastName',
        'financeContactNo',
        'financeEmail',
        'companyName',
        'companyRegNo',
        'companyContactNo',
        'companyFax',
        'companyNatureOfBusiness',
        'orderHistory',
        'updatedAt',
        'createdAt',
      ]),
    });
    const query = [
      ...joinLeft(
        'users',
        'user',
        queryBuilder(req.query.user),
        req.query.user,
        joinLeft(
          'user_groups',
          'userGroup',
          queryBuilder((req.query.user || {}).userGroup),
          (req.query.user || {}).userGroup,
        ),
      ),
      ...joinLeft(
        'memberships',
        'membership',
        queryBuilder(req.query.membership),
        req.query.membership,
      ),
      ...where(queryParams),
    ];

    const data = await models.Customer.aggregate([
      ...query,
      ...notSelect([
        'user.password',
        'user.password',
        'user.validTokens',
        'user.userGroup.roles',
      ]),
      ...paginate({
        pageSize: config.PAGE_SIZE,
        page: 1,
        sort: [],
        ...req.query.meta,
      }),
    ]);
    const total = await models.Customer.aggregate([...query, ...count()]);
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
