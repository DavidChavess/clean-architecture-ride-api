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
    ride.finish()
    await this.rideRepository.update(ride)
    const message = {
      rideId: ride.rideId,
      creditCardToken: 'any_id',
      amount: ride.getFare()
    }
    await this.eventEmitter.send('process-payment-queue', message)
  }
}