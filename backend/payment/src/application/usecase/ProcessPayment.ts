import Payment from "../../domain/entity/Payment"
import { PaymentRepository } from "../../infra/repository/PaymentRepository"

type Input = {
  rideId: string,
  creditCardToken: string,
  amount: number
}

export default class ProcessPayment {

  constructor(
    private readonly paymentRepository: PaymentRepository,
  ) {}

  async execute(input: Input): Promise<void> {
    console.log("ProcessPayment", input)
    const payment = Payment.create(input.rideId, input.amount)
    await this.paymentRepository.save(payment)
  }
}