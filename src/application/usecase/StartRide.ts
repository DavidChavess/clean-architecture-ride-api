import Ride from "../../domain/Ride";
import RideRepository from "../../infra/repository/RideRepository";

export default class StartRide {
  constructor(readonly rideRepository: RideRepository) {}

  async execute(rideId: string): Promise<void> {
    const ride = await this.rideRepository.getRide(rideId)
    if (!ride) throw new Error('Corrida não encontrada')
    if (ride.status != 'accepted') throw new Error('Corrida não foi aceita ainda')
    const startedRide = Ride.restore(ride.rideId, ride.passengerId, ride.fromLat, ride.fromLong, ride.toLat, ride.toLong, 'in_progress', ride.date, ride.driverId)
    await this.rideRepository.update(startedRide)
  }
}