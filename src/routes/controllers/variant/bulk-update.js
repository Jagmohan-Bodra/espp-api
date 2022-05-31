import _ from 'lodash';
import { successResponse, badRequest } from '~/routes/utils/response';
import Models from '~/models';
import { mongooseErrMessageHelper } from '~/routes/utils';

/**
 * @param {Object} deps
 * @param {Models} deps.models
 */
export default ({ models }) => async (req, res) => {
  const { data } = _.pick(req.body, ['data']);
  if (Array.isArray(data)) {
    const variant = await models.Variant.bulkWrite(
      data.map((item) => ({
        updateOne: {
          filter: { _id: item._id },
          update: {
            $set: _.pick(item, [
              'group',
              'type',
              'label',
              'key',
              'value',
              'order',
            ]),
          },
        },
      })),
    ).catch((err) => err);
    if (variant instanceof Error) {
      return badRequest(res, mongooseErrMessageHelper(variant));
    }
  }
  return successResponse(res);
};
