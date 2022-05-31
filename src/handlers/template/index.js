import * as type from './type';

const Handlebars = require('handlebars');
const fs = require('fs');
const path = require('path');

const FOLDER = {
  EMAIL: 'email',
  SMS: 'sms',
  NOTIF: 'notification',
};
const readFileSync = (data, folder, fileName) => {
  const source = fs.readFileSync(
    path.join(__dirname, `./templates/${folder}/${fileName}.hbs`),
    'utf-8',
  );
  return Handlebars.compile(source)(data);
};

export const htmlCompile = (source, data) => Handlebars.compile(source)(data);

export default class HtmlTemplate {
  constructor() {
    this.bundles = {
      // email
      [type.EMAIL_TEMPLATE_FORGET_PASSWORD]: {
        render(data) {
          return readFileSync(data, FOLDER.EMAIL, 'forget-password');
        },
      },
      [type.EMAIL_TEMPLATE_CREATE_USER]: {
        render(data) {
          return readFileSync(data, FOLDER.EMAIL, 'create-user');
        },
      },
      [type.EMAIL_TEMPLATE_INVOICE_ORDER]: {
        render(data) {
          return readFileSync(data, FOLDER.EMAIL, 'invoice-order');
        },
      },
      [type.EMAIL_TEMPLATE_RECEIPT_ORDER]: {
        render(data) {
          return readFileSync(data, FOLDER.EMAIL, 'receipt-order');
        },
      },
      [type.EMAIL_TEMPLATE_SLIP_ORDER]: {
        render(data) {
          return readFileSync(data, FOLDER.EMAIL, 'slip-order');
        },
      },
      [type.EMAIL_TEMPLATE_REGISTER_CUSTOMER]: {
        render(data) {
          return readFileSync(data, FOLDER.EMAIL, 'register-customer');
        },
      },
      [type.EMAIL_TEMPLATE_CUSTOMER_ACTIVE]: {
        render(data) {
          return readFileSync(data, FOLDER.EMAIL, 'customer-active');
        },
      },
      [type.EMAIL_TEMPLATE_CUSTOMER_IN_ACTIVE]: {
        render(data) {
          return readFileSync(data, FOLDER.EMAIL, 'customer-inactive');
        },
      },
    };
  }

  factory(name) {
    return this.bundles[name];
  }
}
