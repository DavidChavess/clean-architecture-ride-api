import AccountDAO from "./AccountDAO";
import { RideAccountNotFoundException } from "./exception/RideAccountNotFoundException";
import RideDAO from "./RideDao";
import crypto from 'crypto'

export type RideInput = {
  accountId: string,
  fromLat: number,
  fromLong: number,
  toLat: number,
  toLong: number
}

export type RideOutput = {
  rideId: string
}

export default class Ride {
  constructor(
    readonly rideDao: RideDAO,
    readonly accountDao: AccountDAO
  ) { }

  async execute(input: RideInput): Promise<RideOutput> {
    const account = await this.accountDao.getById(input.accountId)
    if (!account) throw new RideAccountNotFoundException()
    if (!account.isPassenger) throw new Error("A conta não é de um passageiro")
    if (await this.rideDao.hasPendingRidesForPassenger(account.accountId)) throw new Error("Existem corridas pendentes")
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