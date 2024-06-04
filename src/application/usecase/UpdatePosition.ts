import { Position } from "../../domain/Position";
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
    if (ride.getStatus() != 'in_progress') throw new Error("Corrida deve estar com status: em progresso")
    const position = new Position(input.rideId, input.lat, input.long)
    await this.positionRepository.save(position)
  }
}