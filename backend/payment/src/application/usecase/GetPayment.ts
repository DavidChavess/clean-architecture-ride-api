import { PaymentRepository } from "../../infra/repository/PaymentRepository";

type Output = {
  paymentId: string,
  rideId: string,
  amount: number,
  date: Date,
  status: string
}

export default class GetPayment {

  constructor (private readonly paymentRepository: PaymentRepository ) {}

  async execute(rideId: string): Promise<Output> {
    const payment = await this.paymentRepository.getByRideId(rideId)
    if (!payment) throw new Error('Payment not found')
    return payment
  }
}
