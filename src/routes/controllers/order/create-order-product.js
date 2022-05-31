import { fixNumber } from '~/routes/utils';

export default (models, membership) => async (cart) => {
  const { discountPercent } = membership;
  const { product, quantity } = cart;

  const defaultPrice = product.publicPrice * (1 - discountPercent / 100);
  const total = product.publicPrice * quantity;

  const membershipProduct = await models.MembershipProduct.findOne({
    membership: membership._id,
    product: product._id,
  });

  const price = membershipProduct ? membershipProduct.price : defaultPrice;

  const subTotal = price * quantity;
  const membershipDiscount = total - subTotal;

  // const orderProduct = new models.OrderProduct({
  //   product: product._id,
  //   quantity,
  //   publicPrice: product.publicPrice,
  //   price: fixNumber(price),
  //   total: fixNumber(total),
  //   subTotal: fixNumber(subTotal),
  //   membershipDiscount: fixNumber(membershipDiscount),
  // });
  // await orderProduct.save();

  // return orderProduct;
  return {
    product: product._id,
    quantity,
    publicPrice: product.publicPrice,
    price: fixNumber(price),
    total: fixNumber(total),
    subTotal: fixNumber(subTotal),
    membershipDiscount: fixNumber(membershipDiscount),
  };
};
