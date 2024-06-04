import Ride from '../../domain/Ride'
import { DataBaseConnection } from '../database/DataBaseConnection';

export default interface RideRepository {
  getRidesByDriverIdAndStatusIn(driverId: string, status: string[]): Promise<Ride[] | null>
  getPendingRidesByPassengerId(accountId: string): Promise<Ride[] | null>
  save(ride: Ride): Promise<void>
  update(ride: Ride): Promise<void>
  getRide(rideId: string): Promise<Ride | null>
}

export class RideRepositoryDatabase implements RideRepository {

  constructor(readonly database: DataBaseConnection) {}
  
  async save(ride: Ride): Promise<void> {
    await this.database.query(
      "insert into cccat15.ride (ride_id, passenger_id, status, from_lat, from_long, to_lat, to_long, date) values ($1, $2, $3, $4, $5, $6, $7, $8)",
      [ride.rideId, ride.passengerId, ride.getStatus(), ride.fromLat, ride.fromLong, ride.toLat, ride.toLong, ride.date]
    );
  }

  async update(ride: Ride): Promise<void> {
    await this.database.query(
      'update cccat15.ride set passenger_id = $2, status = $3, from_lat = $4, from_long = $5, to_lat = $6, to_long = $7, date = $8, driver_id = $9 where ride_id = $1',
      [ride.rideId, ride.passengerId, ride.getStatus(), ride.fromLat, ride.fromLong, ride.toLat, ride.toLong, ride.date, ride.getDriverId()]
    );
  }

  async getRide(rideId: string): Promise<Ride | null> {
    const [ride] = await this.database.query( "select * from cccat15.ride where ride_id = $1", [rideId])
    if (!ride) return null
    return this.mapToRide(ride)
  }

  async getPendingRidesByPassengerId(accountId: string): Promise<Ride[] | null> {
    const rides: any[] = await this.database.query("select * from cccat15.ride where passenger_id = $1 and status <> $2", [accountId, "completed"])
    if (!rides || rides.length === 0) return null
    return rides.map(ride => this.mapToRide(ride))
  }

  async getRidesByDriverIdAndStatusIn(driverId: string, status: string[]): Promise<Ride[] | null> {
    const rides: any[] = await this.database.query("select * from cccat15.ride where driver_id = $1 and status IN ($2:csv)", [driverId, status])
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
      ride.date,
      ride.driver_id
    )
  }
}