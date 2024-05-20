import RideDAO from "./RideDao";

export type AccountOuput = {
  accountId: string
  name: string
  email: string
  cpf: string
}

export type RideOutput = {
  rideId: string
  passenger: AccountOuput,
  driver: AccountOuput,
  fromLat: number,
  fromLong: number,
  toLat: number,
  toLong: number,
  status: string,
  date: Date
}

export default class GetRide {
  constructor(readonly rideDao: RideDAO){}

  async execute(rideId: string): Promise<RideOutput | null> {
    return this.rideDao.getRide(rideId)
  }
}