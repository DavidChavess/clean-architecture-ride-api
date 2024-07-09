import { Position } from "../../domain/entity/Position";
import { PositionRepository } from "../../infra/repository/PositionRepository";

type Input = {
  rideId: string,
  lat: number,
  long: number
}

export default class UpdatePosition {
  constructor(
    readonly positionRepository: PositionRepository
  ) {}

  async execute(input: Input): Promise<void> {
    const position = Position.create(input.rideId, input.lat, input.long)
    await this.positionRepository.save(position)
  }
}