import { DomainEvent } from "./DomainEvent";

export default class RideAcceptedEvent implements DomainEvent {
  readonly eventName: string = 'ride_accepted';

  constructor( 
    readonly rideId: string,
    readonly status: string,
    readonly driverId: string
  ) {}
}