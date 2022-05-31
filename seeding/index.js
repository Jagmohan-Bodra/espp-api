var path = require('path');
const csv = require('csvtojson');
import database from './utils/db';
import mongoose from 'mongoose';

const mongodb = database();
const isValid = (id) => mongoose.Types.ObjectId.isValid(id);

const COLLECTIONS = [
  'blocks', 'pages', 'post_categories', 'posts', 'images',
  'settings', 'sites', 'user_groups', 'users',
  'brands', 'colors', 'memberships', 'promotions',
  'product_categories', 'products', 'tags','carts',
  'orders', 'coupons', 'promotion_coupons',
  'internal_notes', 'customers', 'membership_products',
  'order_products', 'enquiries', 'themes','approvals','variants'
]
const seeding = async () => {
  const db = await mongodb.connect();
  await db.dropDatabase();

  return Promise.all([
    ...COLLECTIONS.map(collection => {
      const pathCSV = path.resolve('seeding/' + collection + '.csv');
      return csv().fromFile(pathCSV)
        .then(async (data) => {
          console.log('seeding: ', collection)

          const results = data.map((item, index) => {
            let dt = new Date();
            dt.setSeconds(dt.getSeconds() + index);

            let params = {
              ...item,
              pushlish: item.pushlish ? true : undefined,
              "_id": mongoose.Types.ObjectId(item._id),
              createdAt: dt,
              updatedAt: dt,
            }
            Object.keys(item).map((itemKey) => {
              if(item[itemKey] == "") {
                delete params[itemKey];
                return;
              }
              if (isValid(item[itemKey]) && item[itemKey].length == 24) {
                params[itemKey] = mongoose.Types.ObjectId(params[itemKey]);
              }
              if(Array.isArray(item[itemKey])) {
                params[itemKey] = item[itemKey].map(itemParams => {
                  if(typeof itemParams === 'string' || itemParams instanceof String) {
                    if (isValid(itemParams) && itemParams.length == 24) {
                      return mongoose.Types.ObjectId(itemParams);
                    }
                  }
                  return itemParams;
                })
              }
            })
            return params;
          })
          return await db.collection(collection).insertMany(results);
        })
        .catch((error) => {
          console.log('\n \x1b[33m ====> Error collection "' + collection + '"');
          console.log('\x1b[31m', error);
        });
    })
  ])
}

seeding().then((data) => {
  mongodb.close();
  process.exit(0);
});