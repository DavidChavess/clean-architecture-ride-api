
import { EventEmitter } from "../../infra/event/EventEmitter";
import RideRepository from "../../infra/repository/RideRepository";

type Input = {
  rideId: string,
  lat: number,
  long: number
}

export default class UpdatePosition {
  constructor(
    readonly rideRepository: RideRepository,
    readonly eventEmitter: EventEmitter
  ) {}

  async execute(input: Input): Promise<void> {
    const ride = await this.rideRepository.getRide(input.rideId)
    if (!ride) throw new Error("Ride not found");
    ride.updatePosition(input.lat, input.long)
    await this.rideRepository.update(ride)
    await this.eventEmitter.send('position_updated', input)
  }
}