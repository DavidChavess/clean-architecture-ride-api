import { DomainEvent } from "./DomainEvent";

export default class RideFinishedEvent implements DomainEvent {
  readonly eventName: string = 'ride_finished';

  constructor(readonly rideId: string, readonly creditCardToken: string, readonly amount: number) { }

}