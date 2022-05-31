export default {
  USER_GETLIST: '/users/users',
  USER_CREATE: '/users/user/create',
  USER_UPDATE: '/users/user/edit',
  USER_GET: '/users/user/view',
  USER_DELETE: '/users/user/delete',

  USERGROUP_GETLIST: '/users/roles',
  USERGROUP_CREATE: '/users/role/create',
  USERGROUP_UPDATE: '/users/role/edit',
  USERGROUP_GET: '/users/role/view',
  USERGROUP_DELETE: '/users/role/delete',

  THEME_GETLIST: '/cms/themes',
  THEME_CREATE: '/cms/theme/create',
  THEME_UPDATE: '/cms/theme/edit',
  THEME_GET: '/cms/theme/view',
  THEME_DELETE: '/cms/theme/delete',

  PAGE_GETLIST: '/cms/pages',
  PAGE_CREATE: '/cms/page/create',
  PAGE_UPDATE: '/cms/page/edit',
  PAGE_GET: '/cms/page/view',
  PAGE_DELETE: '/cms/page/delete',

  POST_GETLIST: '/cms/posts',
  POST_CREATE: '/cms/post/create',
  POST_UPDATE: '/cms/post/edit',
  POST_GET: '/cms/post/view',
  POST_DELETE: '/cms/post/delete',

  POST_CATEGORY_GETLIST: '/cms/post-categories',
  POST_CATEGORY_CREATE: '/cms/post-category/create',
  POST_CATEGORY_UPDATE: '/cms/post-category/edit',
  POST_CATEGORY_GET: '/cms/post-category/view',
  POST_CATEGORY_DELETE: '/cms/post-category/delete',

  BLOCK_GETLIST: '/cms/blocks',
  BLOCK_CREATE: '/cms/block/create',
  BLOCK_UPDATE: '/cms/block/edit',
  BLOCK_GET: '/cms/block/view',
  BLOCK_DELETE: '/cms/block/delete',

  CUSTOMER_GETLIST: '/crm/customers',
  CUSTOMER_CREATE: '/crm/customer/create',
  CUSTOMER_UPDATE: '/crm/customer/edit',
  CUSTOMER_GET: '/crm/customer/view',
  CUSTOMER_DELETE: '/crm/customer/delete',
  CUSTOMER_SUBPENDCUSTOMER: '/crm/customer/subspend', // need to review
  CUSTOMER_LOGINASCUSTOMER: '/crm/customer/login-as-customer', // need to review

  CUSTOMER_INTERNALNOTE_GETLIST: '/crm/customer-internal-note', // need to review
  CUSTOMER_INTERNALNOTE_CREATE: '/crm/customer-internal-note/create', // need to review
  CUSTOMER_INTERNALNOTE_GET: '/crm/customer-internal-note/view', // need to review
  CUSTOMER_INTERNALNOTE_DELETE: '/crm/customer-internal-note/delete', // need to review

  MEMBERSHIP_GETLIST: '/crm/memberships',
  MEMBERSHIP_CREATE: '/crm/membership/create',
  MEMBERSHIP_UPDATE: '/crm/membership/edit',
  MEMBERSHIP_GET: '/crm/membership/view',
  MEMBERSHIP_DELETE: '/crm/membership/delete',

  CART_GETLIST: '/sales/carts', // need to review
  CART_CREATE: '/sales/carts/create', // need to review
  CART_UPDATE: '/sales/carts/edit', // need to review
  CART_GET: '/sales/carts/view', // need to review
  CART_DELETE: '/sales/carts/delete', // need to review
  CART_DELETE_ALL: '/sales/carts/delete-all', // need to review

  PRODUCT_GETLIST: '/inventory/products',
  PRODUCT_CREATE: '/inventory/product/create',
  PRODUCT_UPDATE: '/inventory/product/edit',
  PRODUCT_GET: '/inventory/product/view',
  PRODUCT_DELETE: '/inventory/product/delete',
  PRODUCT_IMPORT: '/inventory/product/import', // need to review

  PRODUCT_PRICE_GETLIST: '/inventory/products', // need to review
  PRODUCT_PRICE_UPDATE: '/inventory/product/edit', // need to review
  PRODUCT_PRICE_GET: '/inventory/product/view', // need to review
  PRODUCT_PRICE_DELETE: '/inventory/product/delete', // need to review

  BRAND_GETLIST: '/inventory/brands',
  BRAND_CREATE: '/inventory/brand/create',
  BRAND_UPDATE: '/inventory/brand/edit',
  BRAND_GET: '/inventory/brand/view',
  BRAND_DELETE: '/inventory/brand/delete',

  PRODUCT_CATEGORY_GETLIST: '/inventory/product-categories',
  PRODUCT_CATEGORY_CREATE: '/inventory/product-category/create',
  PRODUCT_CATEGORY_UPDATE: '/inventory/product-category/edit',
  PRODUCT_CATEGPRY_GET: '/inventory/product-category/view',
  PRODUCT_CATEGORY_DELETE: '/inventory/product-category/delete',

  COLOR_GETLIST: '/inventory/colors',
  COLOR_CREATE: '/inventory/color/create',
  COLOR_UPDATE: '/inventory/color/edit',
  COLOR_GET: '/inventory/color/view',
  COLOR_DELETE: '/inventory/color/delete',

  TAG_GETLIST: '/inventory/tags',
  TAG_CREATE: '/inventory/tag/create',
  TAG_UPDATE: '/inventory/tag/edit',
  TAG_GET: '/inventory/tag/view',
  TAG_DALETE: '/inventory/tag/delete',

  ORDER_GETLIST: '/sale/orders',
  ORDER_CREATE: '/sale/order/create',
  ORDER_UPDATE: '/sale/order/edit',
  ORDER_GET: '/sale/order/view',
  ORDER_DELETE: '/sale/order/delete',
  ORDER_PRINT: '/sale/order/print',
  ORDER_SENDEMAIL: '/sale/order/send-email',

  ENQUIRY_GETLIST: '/sale/enquiries',
  ENQUIRY_CREATE: '/sale/enquiry/create', // not use
  ENQUIRY_UPDATE: '/sale/enquiry/edit',
  ENQUIRY_GET: '/sale/enquiry/view',
  ENQUIRY_DELETE: '/sale/enquiry/delete',

  PROMOTION_GETLIST: '/promotions', // need to review
  PROMOTION_CREATE: '/promotions/create', // need to review
  PROMOTION_UPDATE: '/promotions/edit', // need to review
  PROMOTION_GET: '/promotions/view', // need to review
  PROMOTION_DELETE: '/promotions/delete', // need to review
  PROMOTION_ADDPRODUCT: '/promotions/add-product', // need to review
  PROMOTION_REMOVEPRODUCT: '/promotions/remove-product', // need to review
};
