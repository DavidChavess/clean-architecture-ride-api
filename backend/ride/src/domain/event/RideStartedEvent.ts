import { DomainEvent } from "./DomainEvent";

export default class RideStartedEvent implements DomainEvent {
  readonly eventName: string = 'ride_started';

  constructor(
    readonly rideId: string,
    readonly status: string
  ) {}
}