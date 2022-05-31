import mongoose from 'mongoose';
import UserSchema from './user';
import UserGroupSchema from './user-group';
import BlockSchema from './block';
import PageSchema from './page';
import PostCategorySchema from './post-category';
import PostSchema from './post';
import SettingSchema from './setting';
import SiteSchema from './site';
import FileSchema from './file';
import ImageSchema from './image';
import CustomerSchema from './customer';
import MembershipSchema from './membership';
import ProductSchema from './product';
import ProductCategorySchema from './product-category';
import tagSchema from './tag';
import colorSchema from './color';
import brandSchema from './brand';
import InternalNoteSchema from './internal-note';
import CouponSchema from './coupon';
import PromotionCouponSchema from './promotion-coupon';
import CartSchema from './cart';
import OrderSchema from './order';
import MembershipProductSchema from './membership-product';
import PromotionSchema from './promotion';
import ProductPromotionSchema from './promotion-product';
import OrderProductSchema from './order-product';
import EnquirySchema from './enquiry';
import EnquiryInternalNoteSchema from './enquiry-internal-note';
import ContactSchema from './contact';
import ThemeSchema from './theme';
import ApprovalSchema from './approval';
import VariantSchema from './variant';
import SubscriptionSchema from './subscription';
import WishlistSchema from './wishlist';

export default class Models {
  constructor({ config }) {
    mongoose
      .connect(config.DB_CONFIG)
      .then(() => {
        console.log('Connected to MongoDB...');
      })
      .catch((err) => {
        console.log('Could not connect to MongoDB:', err);
      });

    this.UserGroup = mongoose.model('user_group', UserGroupSchema());
    this.User = mongoose.model('user', UserSchema());
    this.Block = mongoose.model('block', BlockSchema());
    this.Page = mongoose.model('page', PageSchema());
    this.PostCategory = mongoose.model('post_category', PostCategorySchema());
    this.Post = mongoose.model('post', PostSchema());
    this.Setting = mongoose.model('setting', SettingSchema());
    this.Site = mongoose.model('site', SiteSchema());
    this.File = mongoose.model('file', FileSchema());
    this.Image = mongoose.model('image', ImageSchema());
    this.Customer = mongoose.model('customer', CustomerSchema());
    this.Membership = mongoose.model('membership', MembershipSchema());
    this.Product = mongoose.model('product', ProductSchema());
    this.ProductCategory = mongoose.model(
      'product_category',
      ProductCategorySchema(),
    );
    this.Tag = mongoose.model('tag', tagSchema());
    this.Color = mongoose.model('color', colorSchema());
    this.Brand = mongoose.model('brand', brandSchema());
    this.InternalNote = mongoose.model('internal_note', InternalNoteSchema());
    this.Coupon = mongoose.model('coupon', CouponSchema());
    this.PromotionCoupon = mongoose.model(
      'promotion_coupon',
      PromotionCouponSchema(),
    );
    this.Cart = mongoose.model('cart', CartSchema());
    this.Order = mongoose.model('order', OrderSchema());
    this.OrderProduct = mongoose.model('order_product', OrderProductSchema());
    this.Promotion = mongoose.model('promotion', PromotionSchema());
    this.MembershipProduct = mongoose.model(
      'membership_product',
      MembershipProductSchema(),
    );
    this.ProductPromotion = mongoose.model(
      'product_promotion',
      ProductPromotionSchema(),
    );
    this.Enquiry = mongoose.model('enquiry', EnquirySchema());
    this.EnquiryInternalNote = mongoose.model(
      'enquiry_internal_note',
      EnquiryInternalNoteSchema(),
    );
    this.Approval = mongoose.model('approval', ApprovalSchema());
    this.Contact = mongoose.model('contact', ContactSchema());
    this.Theme = mongoose.model('theme', ThemeSchema());
    this.Variant = mongoose.model('variant', VariantSchema());
    this.Subscription = mongoose.model('subscription', SubscriptionSchema());
    this.Wishlist = mongoose.model('wishlist', WishlistSchema());
    this.close = () => mongoose.connection.close(false);
  }
}
