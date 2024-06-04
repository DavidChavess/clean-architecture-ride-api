import crypto from 'crypto'

export default class Ride {
  private constructor(
    readonly rideId: string,
    readonly passengerId: string,
    readonly fromLat: number,
    readonly fromLong: number,
    readonly toLat: number,
    readonly toLong: number,
    private status: string,
    readonly date: Date,
    private driverId?: string
  ) {
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
}