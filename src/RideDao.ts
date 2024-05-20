import pgp from 'pg-promise'
import { underlineToCamelCase } from './underlineToCamelCase'

export type RideParticipantEntity = {
  accountId: string
  name: string
  email: string
  cpf: string,
  carPlate?: string
}

export type RideEntity = {
  rideId: string
  passenger: RideParticipantEntity,
  driver: RideParticipantEntity,
  driverId: string
  fromLat: number,
  fromLong: number,
  toLat: number,
  toLong: number,
  status: "completed" | "requested",
  date: Date
}

export default interface RideDAO {
  hasPendingRidesForPassenger(accountId: string): Promise<RideEntity | null>
  save(ride: any): Promise<void>
  getRide(rideId: string): Promise<RideEntity | null>
}

export class RideDAODatabase implements RideDAO {

  async save(ride: any): Promise<void> {
    const connection = await pgp()("postgres://postgres:123456@localhost:5432/app")
    await connection.query(
      "insert into cccat15.ride (ride_id, passenger_id, driver_id, status, from_lat, from_long, to_lat, to_long, date) values ($1, $2, $3, $4, $5, $6, $7, $8, $9)", 
      [ride.rideId, ride.passengerId, ride.driverId, ride.status, ride.fromLat, ride.fromLong, ride.toLat, ride.toLong, ride.date ]
    );
		await connection.$pool.end()
  }

  async getRide(rideId: string): Promise<RideEntity | null> {
    const connection = await pgp()("postgres://postgres:123456@localhost:5432/app")
    const query = `
      select * from cccat15.ride as ride 
      inner join cccat15.account as passenger on ride.passenger_id = passenger.account_id
      where ride.ride_id = $1
    `
    const [ride] = await connection.query(query, [rideId])
		await connection.$pool.end()
    return ride && {
      rideId: ride.ride_id,
      fromLat: Number(ride.from_lat),
      fromLong: Number(ride.from_long),
      toLat: Number(ride.to_lat),
      toLong: Number(ride.to_long),
      date: ride.date,
      status: ride.status,
      passenger: {
        accountId: ride.account_id,
        name: ride.name,
        email: ride.email,
        cpf: ride.cpf
      }
    }
  }

  async hasPendingRidesForPassenger(accountId: string): Promise<RideEntity | null> {
    const connection = await pgp()("postgres://postgres:123456@localhost:5432/app")
    const [ride] = await connection.query("select * from cccat15.ride where passenger_id = $1 and status <> $2", [accountId, "completed"])
		await connection.$pool.end()
    return underlineToCamelCase(ride)
  }
}