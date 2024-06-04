import crypto from 'crypto'
import { Coord } from '../vo/Coord'

export default class Ride {
  private from: Coord
  private to: Coord

  private constructor(
    readonly rideId: string,
    readonly passengerId: string,
    fromLat: number,
    fromLong: number,
    toLat: number,
    toLong: number,
    private status: string,
    readonly date: Date,
    private driverId?: string
  ) {
    this.from = new Coord(fromLat, fromLong)
    this.to = new Coord(toLat, toLong)
  }

  static create(passengerId: string, fromLat: number, fromLong: number, toLat: number, toLong: number): Ride {
    const rideId = crypto.randomUUID()
    const status = "requested"
    const date = new Date()
    return new this(rideId, passengerId, fromLat, fromLong, toLat, toLong, status, date)
  }

  static restore(rideId: string, passengerId: string, fromLat: number, fromLong: number, toLat: number, toLong: number, status: string, date: Date, driverId?: string): Ride {
    return new this(rideId, passengerId, fromLat, fromLong, toLat, toLong, status, date, driverId)
  }
  
  accept(driverId: string): void {
    if (this.status != 'requested') throw new Error('O status da corrida precisa ser requested')
    this.status = 'accepted'  
    this.driverId = driverId
  }

  start(): void {
    if (this.status != 'accepted') throw new Error('Corrida não foi aceita ainda')
    this.status = 'in_progress'     
  } 

  getDriverId(): string | undefined {
    return this.driverId
  }

  getStatus(): string {
    return this.status
  }

  getFromLat(): number {
    return this.from.getLatValue()
  }

  getFromLong(): number {
    return this.from.getLongValue()
  }

  getToLat(): number {
    return this.to.getLatValue()
  }

  getToLong(): number {
    return this.to.getLongValue()
  }
}