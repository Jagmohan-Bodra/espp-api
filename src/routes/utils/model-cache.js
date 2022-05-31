const treeArray = (treeArr, rootId = undefined) => {
  const arr = [];
  for (let i = 0; i < treeArr.length; i += 1) {
    const childOfI = (treeArr[i].parent || '')._id == rootId && treeArr[i];
    if (childOfI) {
      const childObj = {
        // ...childOfI,
        _id: childOfI._id,
        children: treeArray(treeArr, childOfI._id),
      };
      arr.push(childObj);
    }
  }
  return arr;
};

export const setCacheProductCategories = async ({ cache, models }) => {
  const productCategories = await models.ProductCategory.find({}).exec();
  const results = treeArray(JSON.parse(JSON.stringify(productCategories)));
  await cache.setCache({ key: 'product_category_list', value: results });
  return results;
};

export const getCacheProductCategories = async ({ cache, models }) => {
  const Categories = await cache.getCache({ key: 'product_category_list' });
  if (Categories) {
    return JSON.parse(Categories);
  }

  const productCategories = await setCacheProductCategories({ cache, models });
  return productCategories;
};

export const getChildProductCategories = async ({ cache, models }, id) => {
  const loop = (data, key, callback) => {
    for (let i = 0; i < data.length; i += 1) {
      if (data[i]._id == key) {
        return callback(data[i], i, data);
      }
      if (data[i].children) {
        const results = loop(data[i].children, key, callback);
        if (results) {
          return results;
        }
      }
    }
    return false;
  };

  const CategoriesTree = await getCacheProductCategories({ cache, models });
  return loop(CategoriesTree, id, (item) => {
    const looping = (children) => {
      let arr = [];
      (children || []).map((itemC) => {
        arr = [...arr, itemC._id, ...looping(itemC.children)];
        return itemC;
      });
      return arr;
    };
    const results = [item._id, ...looping(item.children)];
    return results;
  });
};
