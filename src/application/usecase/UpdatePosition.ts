import { Position } from "../../domain/entity/Position";
import { PositionRepository } from "../../infra/repository/PositionRepository";
import RideRepository from "../../infra/repository/RideRepository";

type Input = {
  rideId: string,
  lat: number,
  long: number
}

export default class UpdatePosition {
  constructor(
    readonly rideRepository: RideRepository,
    readonly positionRepository: PositionRepository
  ) {}

  async execute(input: Input): Promise<void> {
    const ride = await this.rideRepository.getRide(input.rideId)
    if (!ride) throw new Error("Corrida não encontrada");
    ride.updatePosition(input.lat, input.long)
    const position = Position.create(input.rideId, input.lat, input.long)
    await this.positionRepository.save(position)
    await this.rideRepository.update(ride)
  }
}