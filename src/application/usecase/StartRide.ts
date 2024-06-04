import RideRepository from "../../infra/repository/RideRepository";

export default class StartRide {
  constructor(readonly rideRepository: RideRepository) {}

  async execute(rideId: string): Promise<void> {
    const ride = await this.rideRepository.getRide(rideId)
    if (!ride) throw new Error('Corrida não encontrada')
    ride.start()
    await this.rideRepository.update(ride)
  }
}