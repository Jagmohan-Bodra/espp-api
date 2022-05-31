import fs from 'fs';
import _ from 'lodash';
import multer from 'multer';
import csv from 'csvtojson';
import { badRequest, successResponse } from '../../utils/response';
import ROLES from '~/routes/constants/roles';

const getCatalogs = (models, row) => {
  if (!row.CatalogCode) {
    return undefined;
  }

  const catalogCodes = row.CatalogCode.split(';');

  return Promise.all(
    catalogCodes.map(async (catalogCode) => {
      const catalog = await models.ProductCategory.findOne({
        code: catalogCode,
      });
      if (catalog) {
        return catalog._id.toHexString();
      }

      const newCatalog = await new models.ProductCategory({
        code: catalogCode,
      }).save();

      return newCatalog._id.toHexString();
    }),
  );
};

const getBrands = (models, row) => {
  if (!row.BrandCode) {
    return undefined;
  }
  const brandCodes = row.BrandCode.split(';');
  return Promise.all(
    brandCodes.map(async (brandCode) => {
      const brand = await models.Brand.findOne({ code: brandCode });
      if (brand) {
        return brand._id.toHexString();
      }
      const newBrand = await new models.Brand({ code: brandCode }).save();

      return newBrand._id.toHexString();
    }),
  );
};

const getColors = (models, row) => {
  if (!row.ColorCode) {
    return undefined;
  }
  const colorCodes = row.ColorCode.split(';');
  return Promise.all(
    colorCodes.map(async (colorCode) => {
      const color = await models.Color.findOne({ code: colorCode });
      if (color) {
        return color._id.toHexString();
      }
      const newColor = await new models.Color({ code: colorCode }).save();

      return newColor._id.toHexString();
    }),
  );
};

const getTags = (models, row) => {
  if (!row.tags) {
    return undefined;
  }
  const tags = row.tags.split(';');
  return Promise.all(
    tags.map(async (tagName) => {
      const tag = await models.Tag.findOne({ name: tagName });
      if (tag) {
        return tag._id.toHexString();
      }
      const newTag = new models.Tag({ name: tagName });
      const errors = newTag.validateSync();
      if (errors) {
        return undefined;
      }
      await newTag.save();
      return newTag._id.toHexString();
    }),
  );
};

const getImages = (row) => {
  if (!row.images) {
    return undefined;
  }
  return row.images.split(';');
};

const updateMembershipPrice = async (models, row) => {
  const product = await models.Product.findOne({ name: row.name }).exec();
  if (!product) {
    return;
  }

  const membershipProducts = await models.MembershipProduct.find({
    product: product._id,
  }).exec();
  const membershipIds = membershipProducts.map((item) =>
    item.membership.toHexString(),
  );

  const membershipPriceKeys = Object.keys(row).filter((key) =>
    key.includes('_Price'),
  );

  const updateOrInsertMembershipProduct = async (membership, priceData) => {
    if (!membership) {
      return undefined;
    }

    const membershipId = membership._id.toHexString();
    if (membershipIds.includes(membershipId)) {
      const membershipProduct = membershipProducts.find(
        (item) => item.membership.toHexString() === membershipId,
      );
      await membershipProduct
        .set(priceData)
        .save()
        .catch(() => undefined);
    } else {
      await new models.MembershipProduct({
        product: product._id,
        membership: membership._id,
        ...priceData,
      })
        .save()
        .catch(() => undefined);
    }
    return undefined;
  };

  await Promise.all(
    membershipPriceKeys.map(async (key) => {
      const priceData = { price: row[key] };
      const membershipName = key.split('_')[0];

      const membership = await models.Membership.findOne({
        name: membershipName,
      }).exec();

      await updateOrInsertMembershipProduct(membership, priceData);
    }),
  );
};
const rowWapper = (models) => async (row) => {
  const catalogs = await getCatalogs(models, row);
  const brands = await getBrands(models, row);
  const colors = await getColors(models, row);
  const tags = await getTags(models, row);
  const images = getImages(row);

  await updateMembershipPrice(models, row);

  return {
    ..._.omit(row, ['CatalogCode', 'BrandCode', 'ColorCode', 'tags', 'images']),
    catalogs,
    brands,
    colors,
    tags,
    images,
  };
};

const removeEmptyKeys = (data) => {
  const keys = Object.keys(data[0]);
  const newData = [...data];
  data.map((row, index) =>
    keys.map((key) => {
      if (row[key] === '') {
        delete newData[index][key];
      }
      return null;
    }),
  );
  return newData;
};

export default ({ models }, authenticate, validator) => [
  authenticate(ROLES.PRODUCT_IMPORT),
  [],
  validator,
  multer({ dest: 'tmp/csv/' }).single('file'),
  async (req, res) =>
    csv()
      .fromFile(req.file.path)
      .then(removeEmptyKeys)
      .then((data) => Promise.all(data.map(rowWapper(models))))
      .then((products) =>
        models.Product.bulkWrite(
          products.map((product) => ({
            updateOne: {
              filter: { name: product.name },
              update: { $set: product },
              upsert: true,
            },
          })),
        ),
      )
      .then(async (result) => {
        await fs.unlinkSync(req.file.path);

        return successResponse(res, result);
      })
      .catch((err) => badRequest(res, err)),
];
