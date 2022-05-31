export const USER_PUBLIC_KEY = [
  '_id',
  'userGroup',
  'name',
  'userCode',
  'salutation',
  'avatar',
  'firstName',
  'lastName',
  'birthday',
  'address',
  'gender',
  'email',
  'phone',
  'active',
  'updatedAt',
  'createdAt',
  'avatarPath',
  'avatarFullPath',
];

export const USERGROUP_PUBLIC_KEY = [
  '_id',
  'active',
  'roles',
  'name',
  'description',
  'updatedAt',
  'createdAt',
];

export const BLOCK_PUBLIC_KEY = [
  '_id',
  'name',
  'description',
  'avatar',
  'groupCode',
  'styles',
  'content',
  'updatedAt',
  'createdAt',
];

export const PAGE_PUBLIC_KEY = [
  '_id',
  'site',
  'name',
  'description',
  'url',
  'pushlish',
  'seoProps',
  'styles',
  'content',
  'updatedAt',
  'createdAt',
];

export const POST_CATEGOTY_PUBLIC_KEY = [
  '_id',
  'name',
  'url',
  'description',
  'parent',
  'seoProps',
  'status',
  'updatedAt',
  'createdAt',
];

export const POST_PUBLIC_KEY = [
  '_id',
  'site',
  'postCategory',
  'name',
  'description',
  'url',
  'avatar',
  'pushlish',
  'seoProps',
  'styles',
  'updatedAt',
  'createdAt',
];

export const SETTING_PUBLIC_KEY = [
  '_id',
  'key',
  'value',
  'inputType',
  'module',
  'group',
  'label',
  'hint',
  'options',
  'updatedAt',
  'createdAt',
];

export const SITE_PUBLIC_KEY = [
  '_id',
  'key',
  'name',
  'avatar',
  'seoPropDefault',
  'status',
  'updatedAt',
  'createdAt',
];

export const CUSTOMER_PUBLIC_KEY = [
  '_id',
  'remark',
  'designation',
  'contactNo',
  'personalEmail',
  'status',
  'addressBlockNo',
  'addressStresstName',
  'addressFloor',
  'addressUnitNo',
  'addressBuildingName',
  'addressPostCode',
  'addressCity',
  'addressState',
  'addressCountry',
  'financeSalutation',
  'financeFirstName',
  'financeLastName',
  'financeContactNo',
  'financeEmail',
  'companyName',
  'companyRegNo',
  'companyContactNo',
  'companyFax',
  'companyNatureOfBusiness',
  'membership',
  'user',
  'orderHistory',
  'updatedAt',
  'createdAt',
];

export const MEMBERSHIP_PUBLIC_KEY = [
  '_id',
  'name',
  'description',
  'discountPercent',
  'updatedAt',
  'createdAt',
];

export const ORDER_PUBLIC_KEY = [
  'quantity',
  'customer',
  'membership',
  '_id',
  'orderProduct',
  'promotions',
  'orderNo',
  'orderDateTime',
  'amount',
  'shippingLocation',
  'status',
  'totalWeight',
  'discountCode',
  'discountValue',
  'discountName',
  'tax',
  'shippingFee',
  'HandlingFee',
  'subTotal',
  'membershipDiscount',
  'gstPayable',
  'grandTotal',
  'payment',
  'updatedAt',
  'createdAt',
  'active',
];

export const ENQUIRY_PUBLIC_KEY = [
  '_id',
  'internalNote',
  'name',
  'email',
  'contact',
  'product',
  'message',
  'status',
  'reason',
  'updatedAt',
  'createdAt',
];
