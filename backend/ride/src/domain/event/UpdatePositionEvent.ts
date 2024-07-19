import { DomainEvent } from "./DomainEvent";

export default class UpdatePositionEvent implements DomainEvent {
  readonly eventName: string = 'position_updated';

  constructor(readonly rideId: string, readonly lat: number, readonly long: number) { }

}