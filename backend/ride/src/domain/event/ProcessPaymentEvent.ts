import { DomainEvent } from "./DomainEvent";

export default class ProcessPaymentEvent implements DomainEvent {
  readonly eventName: string = 'process_payment';

  constructor(readonly rideId: string, readonly status: string, readonly distance: number, readonly creditCardToken: string, readonly amount: number) { }

}