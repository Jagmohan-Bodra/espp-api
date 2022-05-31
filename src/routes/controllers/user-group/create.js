import _ from 'lodash';
import { body } from 'express-validator';
import { getNow } from '~/routes/utils/date';
import {
  badRequest,
  badRequestFormatter,
  successResponse,
} from '~/routes/utils/response';
import Models from '~/models';
import { mongooseErrMessageHelper } from '~/routes/utils';
import ROLES from '~/routes/constants/roles';

const requestSchema = [
  body('name').notEmpty().withMessage('"name" is not empty'),
  body('description').optional(),
  body('active').optional(),
  body('roles').optional().isArray().withMessage('"roles" Should be array'),
];

/**
 * @param {Object} deps
 * @param {Models} deps.models
 */
export default ({ models }, authenticate, validator) => [
  authenticate(ROLES.USERGROUP_CREATE),
  requestSchema,
  validator,
  async (req, res) => {
    const params = _.pick(req.body, ['name', 'description', 'active', 'roles']);
    const isDuplicateName = await models.UserGroup.findOne({
      name: params.name,
    }).exec();
    if (isDuplicateName) {
      return badRequest(res, badRequestFormatter('name', 'Name is existed'));
    }

    const data = await models
      .UserGroup({ ...params, updatedAt: getNow() })
      .save()
      .catch((err) => err);
    if (data instanceof Error) {
      return badRequest(res, mongooseErrMessageHelper(data));
    }

    return successResponse(res, data);
  },
];
