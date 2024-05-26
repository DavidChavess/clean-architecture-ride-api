import AccountReposity from "./AccountReposity";
import { RideAccountNotFoundException } from "./exception/RideAccountNotFoundException";
import Ride from "./Ride";
import RideRepository from "./RideRepository";

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
    readonly accountRepository: AccountReposity
  ) { }

  async execute(input: Input): Promise<Output> {
    const account = await this.accountRepository.getById(input.passengerId)
    if (!account) throw new RideAccountNotFoundException()
    if (!account.isPassenger) throw new Error("A conta não é de um passageiro")
    const pendingRides = await this.rideRepository.getPendingRidesByPassengerId(account.accountId)
    if (pendingRides) throw new Error("Existem corridas pendentes")
    const ride = Ride.create(input.passengerId, input.fromLat, input.fromLong, input.toLat, input.toLong)
    await this.rideRepository.save(ride)
    return { rideId: ride.rideId }
  }
}