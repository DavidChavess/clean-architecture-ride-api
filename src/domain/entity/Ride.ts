import crypto from 'crypto'
import { Coord } from '../vo/Coord'
import DistanceCalculator from '../ds/DistanceCalculator'

export default class Ride {

  private from: Coord
  private to: Coord
  private last: Coord

  private constructor(
    readonly rideId: string,
    readonly passengerId: string,
    fromLat: number,
    fromLong: number,
    toLat: number,
    toLong: number,
    private status: string,
    readonly date: Date,
    lastLat: number,
    lastLong: number,
    private distance: number,
    private driverId?: string
  ) {
    this.from = new Coord(fromLat, fromLong)
    this.to = new Coord(toLat, toLong)
    this.last = new Coord(lastLat, lastLong)
  }

  static create(passengerId: string, fromLat: number, fromLong: number, toLat: number, toLong: number): Ride {
    const rideId = crypto.randomUUID()
    const status = "requested"
    const date = new Date()
    return new this(rideId, passengerId, fromLat, fromLong, toLat, toLong, status, date, fromLat, fromLong, 0)
  }

  static restore(rideId: string, passengerId: string, fromLat: number, fromLong: number, toLat: number, toLong: number, status: string, date: Date, lastLat: number, lastLong: number, distance: number, driverId?: string): Ride {
    return new this(rideId, passengerId, fromLat, fromLong, toLat, toLong, status, date, lastLat, lastLong, distance, driverId)
  }
  
  accept(driverId: string): void {
    if (this.status != 'requested') throw new Error('The ride was not requested')
    this.status = 'accepted'  
    this.driverId = driverId
  }

  start(): void {
    if (this.status != 'accepted') throw new Error('The ride was not accepted')
    this.status = 'in_progress'     
  } 

  updatePosition(lastLat: number, lastLong: number) {
    if (this.status != 'in_progress') throw new Error("The ride was not in_progress")
    const currentLast = new Coord(lastLat, lastLong)
    const distance = DistanceCalculator.calculate(this.last, currentLast)
    this.distance += distance
    this.last = currentLast
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

  getLastLat(): number {
    return this.last.getLatValue()
  }

  getLastLong(): number {
    return this.last.getLongValue()
  }

  getDistance(): number {
    return this.distance
  }
}