import Ride from "../../domain/Ride";
import AccountRepository from "../../infra/repository/AccountRepository";
import RideRepository from "../../infra/repository/RideRepository";

type Input = {
  rideId: string,
  driverId: string
}

export default class AcceptRide {
  constructor(
    readonly accountRepository: AccountRepository,
    readonly rideRepository: RideRepository
  ){}  

  async execute(input: Input): Promise<void> {
    const driver = await this.accountRepository.getById(input.driverId)
    if (!driver) throw new Error('Motorista não encontrado')
    if (!driver.isDriver) throw new Error('A conta não é de um motorista')
    const ride = await this.rideRepository.getRide(input.rideId)
    if (!ride) throw new Error('Corrida não encontrada')
    if (ride.status != 'requested') throw new Error('O status da corrida precisa ser requested')
    const ridesByDriverIdAndStatusIn = await this.rideRepository.getRidesByDriverIdAndStatusIn(input.driverId, ['accepted', 'in_progress'])
    if (ridesByDriverIdAndStatusIn) throw new Error('Não foi possivel aceitar corrida porque existem corridas pendentes')
    const acceptedRide = Ride.restore(input.rideId, ride.passengerId, ride.fromLat, ride.fromLong, ride.toLat, ride.toLong, 'accepted', ride.date, input.driverId)
    await this.rideRepository.update(acceptedRide)
  }
}