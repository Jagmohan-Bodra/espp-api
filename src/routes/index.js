import * as AuthController from './controllers/auth';
import UserController from './controllers/users';
import UserGroupController from './controllers/user-group';
import SiteController from './controllers/site';
import PageController from './controllers/page';
import PostController from './controllers/post';
import PostCategoryController from './controllers/post-category';
import BlockController from './controllers/block';
import SettingController from './controllers/setting';
// import UploadController from './controllers/upload';
import CustomerController from './controllers/customers';
import ProductController from './controllers/product';
import ProductCategoryController from './controllers/product-category';
import BrandController from './controllers/brand';
import TagController from './controllers/tag';
import ColorController from './controllers/color';
import MembershipController from './controllers/memberships';
import PriceController from './controllers/price';
import CustomerInternalNoteController from './controllers/customer-internal-notes';
import PromotionController from './controllers/promotions';
import CartController from './controllers/cart';
import WishlistController from './controllers/wishlist';
import OrderController from './controllers/order';
import EnquiryController from './controllers/enquiry';
import EnquiryInternalNoteController from './controllers/enquiry-internal-notes';
import ContactController from './controllers/contact';
import ThemeController from './controllers/theme';
import ApprovalController from './controllers/approval';
import VariantController from './controllers/variant';
import SubscriptionController from './controllers/subscription';
import DriveController from './controllers/drive';

import error from './middlewares/error';
import validator from './middlewares/validator';
import authorized from './middlewares/authorized';
import authenticate from './middlewares/authenticate';
import reCapchaAuth from './middlewares/re-capcha-auth';

require('express-group-routes');

export default (router, deps) => {
  router.group('/v1', (r) => {
    r.post('/auth/sign-in', AuthController.signIn(deps, validator));
    r.post('/reset-password', AuthController.resetPassword(deps, validator));

    // get-image
    r.get('/drive/:fileName', DriveController.getFile(deps, validator));
    // r.get('/get-image/:imageName', UploadController.getImage(deps, validator));
    // r.get('/get-file/:fileName', UploadController.getFile(deps, validator));

    r.post('/enquiries', EnquiryController.create(deps, reCapchaAuth));

    r.post('/contacts', ContactController.create(deps, reCapchaAuth));

    r.get('/pages', PageController.getList(deps));
    r.get('/pages/:id', PageController.get(deps, validator));
    r.post('/page-url', PageController.getByUrl(deps, validator));
    r.get('/products/:id', ProductController.get(deps, validator));
    r.get(
      '/product-url/:url',
      ProductController.getDetailsByUrl(deps, validator),
    );
    r.get(
      '/product-categories-url/:url',
      ProductCategoryController.getDetailsByUrl(deps, validator),
    );

    // r.post('/customer-sign-up', CustomerController.signUp(deps, validator));

    r.get('/search-blocks/:id', BlockController.searchOne(deps, validator));

    r.get('/search-tags', TagController.search(deps));
    r.get('/search-tags/:id', TagController.searchOne(deps, validator));

    r.get('/search-colors', ColorController.search(deps));
    r.get('/search-colors/:id', ColorController.searchOne(deps, validator));

    r.get('/search-brands', BrandController.search(deps));
    r.get('/search-brands/:id', BrandController.searchOne(deps, validator));

    r.get('/search-product-categories', ProductCategoryController.search(deps));
    r.get(
      '/search-product-categories/:id',
      ProductCategoryController.searchOne(deps, validator),
    );
    r.get('/search-memberships', MembershipController.search(deps));

    r.get('/approval', ApprovalController.getList(deps));
    r.get('/approval/:approvalId', ApprovalController.get(deps, validator));
    r.post(
      '/approval/:approvalId/approve',
      ApprovalController.approve(deps, validator),
    );
    r.post(
      '/approval/:approvalId/reject',
      ApprovalController.reject(deps, validator),
    );
    r.get(
      '/approval/:approvalId/approve',
      ApprovalController.approve(deps, validator),
    );
    r.get(
      '/approval/:approvalId/reject',
      ApprovalController.reject(deps, validator),
    );
    r.put('/approval/:approvalId', ApprovalController.update(deps, validator));
    r.delete(
      '/approval/:approvalId',
      ApprovalController.doDelete(deps, validator),
    );
    r.post(
      '/customer-sign-up',
      CustomerController.register(deps, validator, reCapchaAuth),
    );

    r.post('/subscription', SubscriptionController.create(deps));

    r.group((r1) => {
      r1.use(authorized(deps));
      r1.group('/drive', (r2) => {
        r2.post('/upload', DriveController.uploadFile(deps, validator));
      });
      r1.get('/me', AuthController.getMe(deps));
      r1.post('/auth/sign-out', AuthController.signOut(deps));
      r1.post(
        '/change-password',
        AuthController.changePassword(deps, validator),
      );
      r1.post('/change-email', AuthController.changeEmail(deps, validator));

      // user
      r1.get('/users', UserController.getList(deps, authenticate));
      r1.post('/users', UserController.create(deps, authenticate, validator));
      r1.get('/users/:id', UserController.get(deps, authenticate, validator));
      r1.put(
        '/users/:id',
        UserController.update(deps, authenticate, validator),
      );
      r1.delete(
        '/users/:id',
        UserController.doDelete(deps, authenticate, validator),
      );

      // user group
      r1.get('/user-groups', UserGroupController.getList(deps, authenticate));
      r1.post(
        '/user-groups',
        UserGroupController.create(deps, authenticate, validator),
      );
      r1.get(
        '/user-groups/:id',
        UserGroupController.get(deps, authenticate, validator),
      );
      r1.put(
        '/user-groups/:id',
        UserGroupController.update(deps, authenticate, validator),
      );
      r1.delete(
        '/user-groups/:id',
        UserGroupController.doDelete(deps, authenticate, validator),
      );

      // site
      r1.get('/sites', SiteController.getList(deps));
      r1.post('/sites', SiteController.create(deps, validator));
      r1.get('/sites/:id', SiteController.get(deps, validator));
      r1.put('/sites/:id', SiteController.update(deps, validator));
      r1.delete('/sites/:id', SiteController.doDelete(deps, validator));

      // themes
      r1.get('/themes', ThemeController.getList(deps, authenticate));
      r1.post('/themes', ThemeController.create(deps, authenticate, validator));
      r1.post(
        '/themes/:id/variant',
        ThemeController.createVariant(deps, validator),
      );
      r1.get('/themes/:id', ThemeController.get(deps, authenticate, validator));
      r1.put(
        '/themes/:id',
        ThemeController.update(deps, authenticate, validator),
      );
      r1.delete(
        '/themes/:id',
        ThemeController.doDelete(deps, authenticate, validator),
      );

      // page
      r1.post('/pages', PageController.create(deps, validator));
      r1.put('/pages/:id', PageController.update(deps, validator));
      r1.delete('/pages/:id', PageController.doDelete(deps, validator));
      r1.post(
        '/pages/:id/variant',
        PageController.createVariant(deps, validator),
      );

      // post
      r1.get('/posts', PostController.getList(deps, authenticate));
      r1.get('/posts/:id', PostController.get(deps, authenticate, validator));
      r1.post('/posts', PostController.create(deps, authenticate, validator));
      r1.put(
        '/posts/:id',
        PostController.update(deps, authenticate, validator),
      );
      r1.delete(
        '/posts/:id',
        PostController.doDelete(deps, authenticate, validator),
      );

      // post-categories
      r1.get(
        '/post-categories',
        PostCategoryController.getList(deps, authenticate),
      );
      r1.post(
        '/post-categories',
        PostCategoryController.create(deps, authenticate, validator),
      );
      r1.get(
        '/post-categories/:id',
        PostCategoryController.get(deps, authenticate, validator),
      );
      r1.put(
        '/post-categories/:id',
        PostCategoryController.update(deps, authenticate, validator),
      );
      r1.delete(
        '/post-categories/:id',
        PostCategoryController.doDelete(deps, authenticate, validator),
      );

      // block
      r1.get('/blocks', BlockController.getList(deps, authenticate));
      r1.post('/blocks', BlockController.create(deps, authenticate, validator));
      r1.get('/blocks/:id', BlockController.get(deps, authenticate, validator));
      r1.put(
        '/blocks/:id',
        BlockController.update(deps, authenticate, validator),
      );
      r1.delete(
        '/blocks/:id',
        BlockController.doDelete(deps, authenticate, validator),
      );

      // customers
      r1.get(
        '/customers',
        CustomerController.getList(deps, authenticate, validator),
      );
      r1.post(
        '/customers',
        CustomerController.create(deps, authenticate, validator),
      );
      r1.get(
        '/customers/:customerId',
        CustomerController.get(deps, authenticate, validator),
      );
      r1.put(
        '/customers/:customerId',
        CustomerController.update(deps, authenticate, validator),
      );
      r1.delete(
        '/customers/:customerId',
        CustomerController.doDelete(deps, authenticate, validator),
      );
      r1.post(
        '/customers/:customerId/subspend',
        CustomerController.subspend(deps, authenticate, validator),
      );
      r1.post(
        '/customers/login-as-customer/:customerId',
        CustomerController.loginAsCustomer(deps, authenticate, validator),
      );
      r1.post(
        '/customer-addresses',
        CustomerController.createAddress(deps, validator),
      );
      r1.put(
        '/customer-addresses/:addressId',
        CustomerController.updateAddress(deps, validator),
      );
      r1.delete(
        '/customer-addresses/:addressId',
        CustomerController.deleteAddress(deps, validator),
      );
      r1.get(
        '/customer-statistical',
        CustomerController.statistical(deps, validator),
      );

      // product
      r1.get('/products', ProductController.getList(deps));
      r1.post(
        '/products',
        ProductController.create(deps, authenticate, validator),
      );
      r1.post(
        '/products/import',
        ProductController.importProduct(deps, authenticate, validator),
      );

      r1.put(
        '/products/:id',
        ProductController.update(deps, authenticate, validator),
      );
      r1.delete(
        '/products/:id',
        ProductController.doDelete(deps, authenticate, validator),
      );
      r1.get('/products-statistical', ProductController.statistical(deps));

      // product category
      r1.get(
        '/product-categories',
        ProductCategoryController.getList(deps, authenticate),
      );
      r1.post(
        '/product-categories',
        ProductCategoryController.create(deps, authenticate, validator),
      );
      r1.get(
        '/product-categories/:id',
        ProductCategoryController.get(deps, authenticate, validator),
      );
      r1.put(
        '/product-categories/:id',
        ProductCategoryController.update(deps, authenticate, validator),
      );
      r1.delete(
        '/product-categories/:id',
        ProductCategoryController.doDelete(deps, authenticate, validator),
      );

      // memberships
      r1.get(
        '/memberships',
        MembershipController.getList(deps, authenticate, validator),
      );
      r1.post(
        '/memberships',
        MembershipController.create(deps, authenticate, validator),
      );
      r1.get(
        '/memberships/:membershipId',
        MembershipController.get(deps, authenticate, validator),
      );
      r1.put(
        '/memberships/:membershipId',
        MembershipController.update(deps, authenticate, validator),
      );
      r1.delete(
        '/memberships/:membershipId',
        MembershipController.doDelele(deps, authenticate, validator),
      );

      // brand
      r1.get('/brands', BrandController.getList(deps, authenticate));
      r1.post('/brands', BrandController.create(deps, authenticate, validator));
      r1.get('/brands/:id', BrandController.get(deps, authenticate, validator));
      r1.put(
        '/brands/:id',
        BrandController.update(deps, authenticate, validator),
      );
      r1.delete(
        '/brands/:id',
        BrandController.doDelete(deps, authenticate, validator),
      );

      // color
      r1.get('/colors', ColorController.getList(deps, authenticate));
      r1.post('/colors', ColorController.create(deps, authenticate, validator));
      r1.get('/colors/:id', ColorController.get(deps, authenticate, validator));
      r1.put(
        '/colors/:id',
        ColorController.update(deps, authenticate, validator),
      );
      r1.delete(
        '/colors/:id',
        ColorController.doDelete(deps, authenticate, validator),
      );

      // tag
      r1.get('/tags', TagController.getList(deps, authenticate));
      r1.post('/tags', TagController.create(deps, authenticate, validator));
      r1.get('/tags/:id', TagController.get(deps, authenticate, validator));
      r1.put('/tags/:id', TagController.update(deps, authenticate, validator));
      r1.delete(
        '/tags/:id',
        TagController.doDelete(deps, authenticate, validator),
      );

      // customer-internal-note
      r1.get(
        '/customer-internal-note/:customerId',
        CustomerInternalNoteController.getList(deps, authenticate, validator),
      );
      r1.post(
        '/customer-internal-note/:customerId',
        CustomerInternalNoteController.create(deps, authenticate, validator),
      );
      r1.get(
        '/customer-internal-note/:customerId/:internalNoteId',
        CustomerInternalNoteController.get(deps, authenticate, validator),
      );
      r1.delete(
        '/customer-internal-note/:customerId/:internalNoteId',
        CustomerInternalNoteController.doDelele(deps, authenticate, validator),
      );

      // price
      r1.get(
        '/product-price/:productId',
        PriceController.getList(deps, authenticate, validator),
      );
      r1.get(
        '/product-price/:productId/:membershipId',
        PriceController.get(deps, authenticate, validator),
      );
      r1.put(
        '/product-price/:productId',
        PriceController.update(deps, authenticate, validator),
      );
      r1.delete(
        '/product-price/:productId/:membershipId',
        PriceController.doDelete(deps, authenticate, validator),
      );

      // promotions
      r1.get(
        '/promotions',
        PromotionController.getList(deps, authenticate, validator),
      );
      r1.post(
        '/promotions',
        PromotionController.create(deps, authenticate, validator),
      );
      r1.get(
        '/promotions/:promotionId',
        PromotionController.get(deps, authenticate, validator),
      );
      r1.put(
        '/promotions/:promotionId',
        PromotionController.update(deps, authenticate, validator),
      );
      r1.delete(
        '/promotions/:promotionId',
        PromotionController.doDelete(deps, authenticate, validator),
      );
      r1.post(
        '/promotions/:promotionId',
        PromotionController.addProducts(deps, authenticate, validator),
      );
      r1.delete(
        '/promotions/:promotionId/products/:productId',
        PromotionController.removeProducts(deps, authenticate, validator),
      );

      // cart
      r1.get('/carts', CartController.getList(deps, authenticate, validator));
      r1.post('/carts', CartController.create(deps, authenticate, validator));
      r1.get(
        '/carts/:cartId',
        CartController.get(deps, authenticate, validator),
      );
      r1.put(
        '/carts/:cartId',
        CartController.update(deps, authenticate, validator),
      );
      r1.delete('/carts', CartController.deleteAll(deps, authenticate));
      r1.delete(
        '/carts/:cartId',
        CartController.doDelete(deps, authenticate, validator),
      );

      // wishlist
      r1.get('/wishlist', WishlistController.getList(deps, validator));
      r1.post('/wishlist', WishlistController.create(deps, validator));
      r1.get('/wishlist/:wishlistId', WishlistController.get(deps, validator));
      r1.delete('/wishlist', WishlistController.deleteAll(deps));
      r1.delete(
        '/wishlist/:wishlistId',
        WishlistController.doDelete(deps, validator),
      );

      // order
      r1.get('/orders', OrderController.getList(deps, authenticate, validator));
      r1.post('/orders', OrderController.create(deps, authenticate, validator));
      r1.get(
        '/orders/:orderId',
        OrderController.get(deps, authenticate, validator),
      );
      r1.put(
        '/orders/:orderId',
        OrderController.update(deps, authenticate, validator),
      );
      r1.delete(
        '/orders/:orderId',
        OrderController.doDelele(deps, authenticate, validator),
      );

      r1.post(
        '/orders/:orderId/print',
        OrderController.print(deps, authenticate, validator),
      );

      r1.post(
        '/orders/:orderId/send-email',
        OrderController.sendEmail(deps, authenticate, validator),
      );

      r1.get('/me-orders', OrderController.meGetList(deps));
      r1.get(
        '/orders-by-no/:orderNo',
        OrderController.getByOrderNo(deps, validator),
      );
      r1.put(
        '/orders/:orderId/update-payment',
        OrderController.updatePayment(deps, validator),
      );
      r1.put(
        '/orders-update-archive-all',
        OrderController.updateArchiveAll(deps, validator),
      );
      r1.get(
        '/orders-statistical',
        OrderController.statistical(deps, validator),
      );

      // setting
      r1.get('/settings', SettingController.getList(deps));
      r1.put(
        '/settings/update-bulk',
        SettingController.updateMulti(deps, validator),
      );

      // enquiry
      r1.get('/enquiries', EnquiryController.getList(deps, authenticate));
      r1.get(
        '/enquiries/:enquiryId',
        EnquiryController.get(deps, authenticate, validator),
      );
      r1.put(
        '/enquiries/:enquiryId',
        EnquiryController.update(deps, authenticate, validator),
      );
      r1.delete(
        '/enquiries/:enquiryId',
        EnquiryController.doDelete(deps, authenticate, validator),
      );
      r1.post(
        '/enquiry-internal-note/:enquiryId',
        EnquiryInternalNoteController.create(deps, validator),
      );

      // contact
      r1.get('/contacts', ContactController.getList(deps, validator));
      r1.get('/contacts/:contactId', ContactController.get(deps, validator));
      r1.delete(
        '/contacts/:contactId',
        ContactController.doDelete(deps, validator),
      );

      // variant
      r1.put('/variants', VariantController.bulkUpdate(deps));

      // subscription
      r1.get('/subscription', SubscriptionController.getList(deps));

      // upload
      // r1.post('/upload-image', UploadController.uploadImage(deps, validator));
      // r1.post('/upload-file', UploadController.uploadFile(deps, validator));
    });
  });

  router.use(error);

  return router;
};
