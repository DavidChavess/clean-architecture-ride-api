import Ride from "../../domain/entity/Ride";
import { AccountGateway } from "../../infra/gateway/AccountGatewayHttp";
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
  lastLat: number,
  lastLong: number,
  distance: number,
  status: string,
  date: Date,
  fare: number
}

export default class GetRide {
  constructor(
    readonly rideDao: RideRepository,
    readonly accountGateway: AccountGateway
  ) { }

  async execute(rideId: string): Promise<Output> {
    const ride = await this.rideDao.getRide(rideId)
    if (!ride) throw new Error("Ride not found")
    const passenger = await this.accountGateway.getById(ride.passengerId)
    if (!passenger) throw new Error("Passenger not found")
    if (!ride.getDriverId()) return this.toOutput(ride, passenger)
    const driver = await this.accountGateway.getById(ride.getDriverId()!!)
    if (!driver) throw new Error("Driver not found");
    return this.toOutput(ride, passenger, driver)
  }

  private toOutput(ride: Ride, passenger: any, driver?: any): Output {
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
        name: passenger.name
      },
      lastLat: ride.getLastLat(),
      lastLong: ride.getLastLong(),
      distance: ride.getDistance(),
      fare: ride.getFare()
    }
    if (driver) {
      output.driver =  {
        accountId: driver.accountId,
        name: driver.name
      }
    }
    return output
  }
}