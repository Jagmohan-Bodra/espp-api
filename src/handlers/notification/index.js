import * as type from './type';
import forgotPasswordAction from './action/forgot-password';
import createUserAction from './action/createUser';
import MessageQueue from '~/clients/queue';
import changeEmail from './action/change-email';
import invoiceOrder from './action/invoice-order';
import receiptOrder from './action/receipt-order';
import slipOrder from './action/slip-order';
import registerCustomer from './action/register-cutomer';
import customerActive from './action/customer-active';
import customerInactive from './action/customer-inactive';
import paymentLocalBankTransfer from './action/payment-local-bank-transfer';
import paymentPaynow from './action/payment-paynow';
import paymentPaypal from './action/payment-paypal';
import orderThankyou from './action/thank-you-order-complete';
import orderSorry from './action/sorry-order-complete';
import contactUs from './action/contact-us';

export default class NotificationHandler {
  /**
   * @param {Object} deps
   * @param {MessageQueue} deps.messageQueue
   */
  constructor(deps) {
    this.deps = deps;
    this.bundles = {
      [type.FORGOT_PASSWORD]: forgotPasswordAction(deps),
      [type.CREATE_USER]: createUserAction(deps),
      [type.CHANGE_EMAIL]: changeEmail(deps),
      [type.ORDER_INVOICE]: invoiceOrder(deps),
      [type.ORDER_RECEIPT]: receiptOrder(deps),
      [type.ORDER_SLIP]: slipOrder(deps),
      [type.REGISTER_CUSTOMER]: registerCustomer(deps),
      [type.CUSTOMER_ACTIVE]: customerActive(deps),
      [type.CUSTOMER_INACTIVE]: customerInactive(deps),
      [type.PAYMENT_LOCAL_BANK_TRANSFER]: paymentLocalBankTransfer(deps),
      [type.PAYMENT_PAYNOW]: paymentPaynow(deps),
      [type.PAYMENT_PAYPAL]: paymentPaypal(deps),
      [type.ORDER_THANK_YOU]: orderThankyou(deps),
      [type.ORDER_SORRY]: orderSorry(deps),
      [type.CONTACT_US]: contactUs(deps),
    };
  }

  static type = type;

  publish(eventType, payload, delay = 0) {
    return this.deps.messageQueue.notification.add(
      { eventType, payload },
      { delay },
    );
  }

  factory(eventType) {
    return this.bundles[eventType];
  }
}
