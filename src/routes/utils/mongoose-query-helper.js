export const where = (query) => [
  {
    $match: query,
  },
];

export const select = (fieldArr) => [
  {
    $project: Object.assign({}, ...fieldArr.map((item) => ({ [item]: 1 }))),
  },
];

export const notSelect = (fieldArr) => [
  {
    $project: Object.assign({}, ...fieldArr.map((item) => ({ [item]: 0 }))),
  },
];

export const count = () => [
  {
    $count: 'count',
  },
];

export const limit = (number) => [
  {
    $limit: number,
  },
];

export const skip = (number) => [
  {
    $skip: number,
  },
];

export const sort = (fieldArr) => [
  {
    $sort: Object.assign(
      {},
      ...(fieldArr || []).map((item) => {
        if (item.charAt(0) == '-') {
          return { [item.substring(1)]: -1 };
        }
        return { [item]: 1 };
      }),
    ),
  },
];

export const groupBy = (field, expressions) => [
  {
    $group: {
      _id: field,
      ...expressions,
    },
  },
];

export const joinLeft = (name, path, query, isUnwind, pipeline = []) =>
  [
    {
      $lookup: {
        from: name,
        as: path,
        let: { [path]: `$${path}` },
        pipeline: [
          {
            $match: {
              ...query,
              $expr: { $eq: ['$_id', `$$${path}`] },
            },
          },
          ...pipeline,
        ],
      },
    },
    {
      $unwind: {
        path: `$${path}`,
        preserveNullAndEmptyArrays: !isUnwind,
      },
    },
  ].filter((item) => item);

export const joinLefts = (name, path, query, pipeline = []) => [
  {
    $lookup: {
      from: name,
      let: { [path]: `$${path}` },
      pipeline: [
        {
          $match: {
            ...query,
            $expr: { $in: ['$_id', `$$${path}`] },
          },
        },
        ...pipeline,
      ],
      as: path,
    },
  },
];

export const joinLeftModel = (
  name,
  path,
  query,
  pipeline = [],
  foreignField = '$_id',
) => [
  {
    $lookup: {
      from: name,
      let: { local_id: '$_id' },
      pipeline: [
        {
          $match: {
            ...query,
            $expr: { $eq: [foreignField, '$$local_id'] },
          },
        },
        ...pipeline,
      ],
      as: path,
    },
  },
];

export const related = (name, path) => [
  {
    $lookup: {
      from: name,
      localField: '_id',
      foreignField: '_id',
      as: path,
    },
  },
];

export const paginate = ({ pageSize, page, sort: sortParams }) => [
  ...sort((sortParams || []).length > 0 ? sortParams : ['-createdAt']),
  ...skip((parseInt(page, 10) - 1) * parseInt(pageSize, 10)),
  ...limit(parseInt(pageSize, 10)),
];
