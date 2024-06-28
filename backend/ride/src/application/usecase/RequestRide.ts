import Ride from "../../domain/entity/Ride";
import RideRepository from "../../infra/repository/RideRepository";
import { AccountGateway } from "../../infra/gateway/AccountGatewayHttp";

type Input = {
  passengerId: string,
  fromLat: number,
  fromLong: number,
  toLat: number,
  toLong: number
}

type Output = {
  rideId: string
}

export default class RequestRide {
  constructor(
    readonly rideRepository: RideRepository,
    readonly accountGateway: AccountGateway
  ) { }

  async execute(input: Input): Promise<Output> {
    const account = await this.accountGateway.getById(input.passengerId)
    if (!account) throw new Error("To create a ride, it's necessary that the account exists.")
    if (!account.isPassenger) throw new Error("The account is not a passenger")
    const pendingRides = await this.rideRepository.getPendingRidesByPassengerId(account.accountId)
    if (pendingRides) throw new Error("It was not possible to request the ride because there are pending rides from the passenger")
    const ride = Ride.create(input.passengerId, input.fromLat, input.fromLong, input.toLat, input.toLong)
    await this.rideRepository.save(ride)
    return { rideId: ride.rideId }
  }
}