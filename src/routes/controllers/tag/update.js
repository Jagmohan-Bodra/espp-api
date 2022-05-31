import _ from 'lodash';
import { param } from 'express-validator';
import { badRequest, notFound, successResponse } from '~/routes/utils/response';
import { getObjectId, isValid, mongooseErrMessageHelper } from '~/routes/utils';
import Models from '~/models';
import ROLES from '~/routes/constants/roles';

/**
 * @param {Object} deps
 * @param {Models} deps.models
 */
export default ({ models }, authenticate, validator) => [
  authenticate(ROLES.TAG_UPDATE),
  [param('id').custom(isValid).withMessage('"id" must be a objectId value')],
  validator,
  async (req, res) => {
    const data = _.pick(req.body, [
      'name',
      'description',
      'seoProps',
      'status',
    ]);

    const model = await models.Tag.findOne({
      _id: getObjectId(req.params.id),
    });
    if (!model) {
      return notFound(res);
    }

    model.set(data);
    const errors = model.validateSync();
    if (errors) {
      return badRequest(res, errors);
    }

    const newModel = await model.save().catch((err) => err);
    if (newModel instanceof Error) {
      return badRequest(res, mongooseErrMessageHelper(newModel));
    }
    return successResponse(res, newModel);
  },
];
