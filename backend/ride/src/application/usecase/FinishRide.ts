import { DomainEvent } from "../../domain/event/DomainEvent";
import { EventEmitter } from "../../infra/event/EventEmitter";
import RideRepository from "../../infra/repository/RideRepository";

export default class FinishRide {

  constructor(
    readonly rideRepository: RideRepository,
    readonly eventEmitter: EventEmitter
  ) {}

  async execute(rideId: string): Promise<void> {
    const ride = await this.rideRepository.getRide(rideId)
    if (!ride) throw new Error('Ride not found')
    const events = ['process_payment', 'ride_finished']
    events.forEach(event => {
      ride.register(event, async (domainEvent: DomainEvent) => {
        await this.eventEmitter.notify(domainEvent.eventName, domainEvent)
      })
    })
    ride.finish()
    await this.rideRepository.update(ride)
  }
}