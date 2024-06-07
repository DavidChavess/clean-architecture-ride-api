import Ride from '../../domain/entity/Ride'
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
      "insert into cccat15.ride (ride_id, passenger_id, status, from_lat, from_long, to_lat, to_long, date, last_lat, last_long, distance) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)",
      [ride.rideId, ride.passengerId, ride.getStatus(), ride.getFromLat(), ride.getFromLong(), ride.getToLat(), ride.getToLong(), ride.date, ride.getLastLat(), ride.getLastLong(), ride.getDistance()]
    );
  }

  async update(ride: Ride): Promise<void> {
    await this.database.query(
      'update cccat15.ride set status = $1, driver_id = $2, distance = $3, last_lat = $4, last_long = $5, fare = $6 where ride_id = $7',
      [ride.getStatus(), ride.getDriverId(), ride.getDistance(), ride.getLastLat(), ride.getLastLong(), ride.getFare(), ride.rideId]
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
      Number(ride.last_lat),
      Number(ride.last_long),
      Number(ride.distance),
      Number(ride.fare),
      ride.driver_id
    )
  }
}