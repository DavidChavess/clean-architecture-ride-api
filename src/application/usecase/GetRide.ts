import AccountReposity from "../../infra/repository/AccountReposity";
import RideRepository from "../../infra/repository/RideRepository";

type PassengetOutput = {
  accountId: string, 
  name: string
}

type Output = {
  rideId: string
  passenger: PassengetOutput,
  fromLat: number,
  fromLong: number,
  toLat: number,
  toLong: number,
  status: string,
  date: Date
}

export default class GetRide {
  constructor(
    readonly rideDao: RideRepository,
    readonly accountRepository: AccountReposity
  ){}

  async execute(rideId: string): Promise<Output> {
    const ride = await this.rideDao.getRide(rideId)
    if (!ride) throw new Error("Ride not found")
    const passenger = await this.accountRepository.getById(ride.passengerId)
    if (!passenger) throw new Error("Passenger not found")
    return {
      ...ride,
      passenger: {
        accountId: passenger.accountId,
        name: passenger.name
      }
    }
  }
}