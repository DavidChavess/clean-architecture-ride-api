import crypto from 'crypto'

export default class Payment {
  private constructor(
    readonly paymentId: string,
    readonly rideId: string,
    readonly amount: number,
    readonly date: Date,
    readonly status: string
  ) {}

  static create(rideId: string, amount: number): Payment {
    const date = new Date()
    const status = 'success'
    return new Payment(crypto.randomUUID(), rideId, amount, date, status)
  }
  
  static restore(paymentId: string, rideId: string, amount: number, date: Date, status: string): Payment {
    return new Payment(paymentId, rideId, amount, date, status)
  }
}