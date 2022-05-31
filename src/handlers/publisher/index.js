import * as type from './type';
import action from './action';

export default class PublisherHandler {
  constructor(deps) {
    this.deps = deps;
    this.bundles = {
      [type.CREATE_CUSTOMER_PUBLISHER]: action.createCustomer(deps),
      [type.UPDATE_CUSTOMER_PUBLISHER]: action.updateCustomer(deps),
      [type.DELETE_CUSTOMER_PUBLISHER]: action.deleteCustomer(deps),
      [type.CREATE_ORDER_PUBLISHER]: action.createOrder(deps),
      [type.UPDATE_STATUS_ORDER_PUBLISHER]: action.updateStatusOrder(deps),
      [type.UPDATE_CANCEL_ORDER_PUBLISHER]: action.updateCancelStatusOrder(
        deps,
      ),
    };
  }

  publish(eventType, payload, delay = 0) {
    return this.deps.messageQueue.publisher.add(
      { eventType, payload },
      { delay },
    );
  }

  factory(eventType) {
    return this.bundles[eventType];
  }
}
