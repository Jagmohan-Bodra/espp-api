import { body } from 'express-validator';
import _ from 'lodash';
import { successResponse } from '../../utils/response';
import Models from '~/models';
import { getObjectId } from '~/routes/utils';

const updateSchema = [body('orderIds').isArray()];

/**
 * @param {Object} deps
 * @param {Models} deps.models
 */
export default ({ models }, validator) => [
  updateSchema,
  validator,
  async (req, res) => {
    const { orderIds } = _.pick(req.body, ['orderIds']);

    // Update quantity product
    await models.Order.bulkWrite(
      orderIds.map((id) => ({
        updateOne: {
          filter: { _id: getObjectId(id) },
          update: {
            $set: { active: false },
          },
        },
      })),
    );

    return successResponse(res);
  },
];
