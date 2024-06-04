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
    const ridesByDriverIdAndStatusIn = await this.rideRepository.getRidesByDriverIdAndStatusIn(input.driverId, ['accepted', 'in_progress'])
    if (ridesByDriverIdAndStatusIn) throw new Error('Não foi possivel aceitar corrida porque existem corridas pendentes')
    ride.accept(input.driverId)
    await this.rideRepository.update(ride)
  }
}