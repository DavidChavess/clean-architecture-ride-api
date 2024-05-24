import AccountReposity from "./AccountReposity";
import { RideAccountNotFoundException } from "./exception/RideAccountNotFoundException";
import RideDAO from "./RideDAO";
import crypto from 'crypto'

export type RequestRideInput = {
  accountId: string,
  fromLat: number,
  fromLong: number,
  toLat: number,
  toLong: number
}

export type RequestRideOutput = {
  rideId: string
}

export default class RequestRide {
  constructor(
    readonly rideDao: RideDAO,
    readonly accountRepository: AccountReposity
  ) { }

  async execute(input: RequestRideInput): Promise<RequestRideOutput> {
    const account = await this.accountRepository.getById(input.accountId)
    if (!account) throw new RideAccountNotFoundException()
    if (!account.isPassenger) throw new Error("A conta não é de um passageiro")
    if (await this.rideDao.getPendingRidesByPassengerId(account.accountId)) throw new Error("Existem corridas pendentes")
    const rideId = crypto.randomUUID()
    const ride = {
      ...input,
      rideId,
      passengerId: input.accountId,
      status: "requested",
      date: new Date()
    };
    await this.rideDao.save(ride)
    return { rideId }
  }
}