import Account from "../../domain/entity/Account";
import Ride from "../../domain/entity/Ride";
import AccountRepository from "../../infra/repository/AccountRepository";
import RideRepository from "../../infra/repository/RideRepository";

type AccountRide = {
  accountId: string,
  name: string
}

type Output = {
  rideId: string
  passenger: AccountRide,
  driver?: AccountRide,
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
    readonly accountRepository: AccountRepository
  ) { }

  async execute(rideId: string): Promise<Output> {
    const ride = await this.rideDao.getRide(rideId)
    if (!ride) throw new Error("Ride not found")
    const passenger = await this.accountRepository.getById(ride.passengerId)
    if (!passenger) throw new Error("Passenger not found")
    if (!ride.getDriverId()) return this.toOutput(ride, passenger)
    const driver = await this.accountRepository.getById(ride.getDriverId()!!)
    if (!driver) throw new Error("Driver not found");
    return this.toOutput(ride, passenger, driver)
  }

  private toOutput(ride: Ride, passenger: Account, driver?: Account): Output {
    const output: Output =  {
      rideId: ride.rideId,
      fromLat: ride.getFromLat(),
      toLat: ride.getToLat(),
      fromLong: ride.getFromLong(),
      toLong: ride.getToLong(),
      status: ride.getStatus(),
      date: ride.date,
      passenger: {
        accountId: passenger.accountId,
        name: passenger.getName()
      }
    }
    if (driver) {
      output.driver =  {
        accountId: driver.accountId,
        name: driver.getName()
      }
    }
    return output
  }
}