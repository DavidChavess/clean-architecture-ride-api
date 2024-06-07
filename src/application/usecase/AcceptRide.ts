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
    if (!driver) throw new Error('Driver not found')
    if (!driver.isDriver) throw new Error('The account is not a driver')
    const ride = await this.rideRepository.getRide(input.rideId)
    if (!ride) throw new Error('Ride not found')
    const ridesByDriverIdAndStatusIn = await this.rideRepository.getRidesByDriverIdAndStatusIn(input.driverId, ['accepted', 'in_progress'])
    if (ridesByDriverIdAndStatusIn) throw new Error('It was not possible to accept the ride because there are pending rides from the driver')
    ride.accept(input.driverId)
    await this.rideRepository.update(ride)
  }
}