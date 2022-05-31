export const getMembershipPrice = async (
  { models },
  productId,
  memberId,
  publicPrice,
) => {
  const membershipProduct = await models.MembershipProduct.findOne({
    membership: memberId,
    product: productId,
  });
  if (membershipProduct) {
    return [membershipProduct.price, membershipProduct.moq];
  }
  const membership = await models.Membership.findById(memberId).exec();
  if (membership) {
    return [
      Number(
        ((publicPrice * (100 - membership.discountPercent)) / 100).toFixed(6),
      ),
      0,
    ];
  }
  return [publicPrice, 0];
};

export default getMembershipPrice;
