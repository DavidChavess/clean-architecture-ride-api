import { DomainEvent } from "./DomainEvent";

export default class RideRequestedEvent implements DomainEvent {
  readonly eventName: string = 'ride_requested';

  constructor( 
    readonly rideId: string,
    readonly passengerId: string,
    readonly fromLat: number,
    readonly fromLong: number,
    readonly toLat: number,
    readonly toLong: number,
    readonly status: string,
    readonly date: Date,
    readonly lastLat: number,
    readonly lastLong: number,
    readonly distance: number,
    readonly fare: number,
    readonly driverId?: string
  ) {}
}