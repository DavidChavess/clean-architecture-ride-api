import { PositionRepository } from "../../infra/repository/PositionRepository";

type Output = {
  positionId: string,
  rideId: string,
  lat: number,
  long: number
}

export default class GetPositions {
  constructor(readonly positionRepository: PositionRepository){}

  async execute(rideId: string): Promise<Output[]> {
    const positions = await this.positionRepository.getPositionsByRideId(rideId)
    if (!positions) throw new Error('Positions not found')
    return positions.map(position => ({
      positionId: position.positionId,
      rideId: position.rideId,
      lat: position.getLat(),
      long: position.getLong()
    }))
  }
}
