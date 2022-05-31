import RegisterCustomer from './register-customer';
import payment from './payment';
import errorMessages from '~/routes/constants/error-messages';
import { APPROVAL_TYPE } from '~/routes/constants/master-data';

export default class ApprovalHandler {
  constructor(deps) {
    this.deps = deps;
    this.bundles = {
      [APPROVAL_TYPE.REGISTER_CUSTOMER]: RegisterCustomer(deps),
      [APPROVAL_TYPE.PAYMENT]: payment(deps),
    };
  }

  factory(type) {
    if (!this.bundles[type]) {
      return {
        errors: { code: 422, message: errorMessages.APPROVAL_TYPE_NOT_EXIST },
      };
    }

    return this.bundles[type];
  }
}
