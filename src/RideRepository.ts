import pgp from 'pg-promise'
import Ride from './Ride'

export default interface RideRepository {
  getPendingRidesByPassengerId(accountId: string): Promise<Ride[] | null>
  save(ride: Ride): Promise<void>
  getRide(rideId: string): Promise<Ride | null>
}

export class RideRepositoryDatabase implements RideRepository {
  async save(ride: Ride): Promise<void> {
    const connection = await pgp()("postgres://postgres:123456@localhost:5432/app")
    await connection.query(
      "insert into cccat15.ride (ride_id, passenger_id, status, from_lat, from_long, to_lat, to_long, date) values ($1, $2, $3, $4, $5, $6, $7, $8)",
      [ride.rideId, ride.passengerId, ride.status, ride.fromLat, ride.fromLong, ride.toLat, ride.toLong, ride.date]
    );
    await connection.$pool.end()
  }

  async getRide(rideId: string): Promise<Ride | null> {
    const connection = await pgp()("postgres://postgres:123456@localhost:5432/app")
    const query = "select * from cccat15.ride where ride_id = $1"
    const [ride] = await connection.query(query, [rideId])
    await connection.$pool.end()
    if (!ride) return null
    return this.mapToRide(ride)
  }

  async getPendingRidesByPassengerId(accountId: string): Promise<Ride[] | null> {
    const connection = await pgp()("postgres://postgres:123456@localhost:5432/app")
    const rides: any[] = await connection.query("select * from cccat15.ride where passenger_id = $1 and status <> $2", [accountId, "completed"])
    await connection.$pool.end()
    if (!rides || rides.length === 0) return null
    return rides.map(ride => this.mapToRide(ride))
  }

  private mapToRide(ride: any): Ride {
    return Ride.restore(
      ride.ride_id,
      ride.passenger_id,
      Number(ride.from_lat),
      Number(ride.from_long),
      Number(ride.to_lat),
      Number(ride.to_long), 
      ride.status, 
      ride.date
    )
  }
}