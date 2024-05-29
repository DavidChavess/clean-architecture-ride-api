import Ride from "../../domain/Ride";
import AccountReposity from "../../infra/repository/AccountReposity";
import RideRepository from "../../infra/repository/RideRepository";

type Account = {
  accountId: string,
  name: string
}

type Output = {
  rideId: string
  passenger: Account,
  driver: Account | null,
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
  ) { }

  async execute(rideId: string): Promise<Output> {
    const ride = await this.rideDao.getRide(rideId)
    if (!ride) throw new Error("Ride not found")
    const passenger = await this.accountRepository.getById(ride.passengerId)
    if (!passenger) throw new Error("Passenger not found")
    const driver = await this.accountRepository.getById(ride.driverId)
    return this.toOutput(ride, passenger, driver)
  }

  private toOutput(ride: Ride, passenger: Account, driver: Account | null): Output {
    return {
      rideId: ride.rideId,
      fromLat: ride.fromLat,
      toLat: ride.toLat,
      fromLong: ride.fromLong,
      toLong: ride.toLong,
      status: ride.status,
      date: ride.date,
      driver,
      passenger: {
        accountId: passenger.accountId,
        name: passenger.name
      }
    }
  }
}