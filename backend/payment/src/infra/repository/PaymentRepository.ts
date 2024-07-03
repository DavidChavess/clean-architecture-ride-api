import Payment from "../../domain/entity/Payment";
import { DataBaseConnection } from "../database/DataBaseConnection";

export interface PaymentRepository {
  save(payment: Payment): Promise<void>
  getByRideId(rideId: string): Promise<Payment | null>
}

export class PaymentRepositoryDatabase implements PaymentRepository {

  constructor (private readonly database: DataBaseConnection) {}

  async save(payment: Payment): Promise<void> {
    await this.database.query(
      "insert into cccat15.payment (payment_id, ride_id, amount, date, status) values ($1, $2, $3, $4, $5)", 
      [payment.paymentId, payment.rideId, payment.amount, payment.date, payment.status]
    );
  }

  async getByRideId(rideId: string): Promise<Payment | null> {
    const [payment] = await this.database.query("select * from cccat15.payment where ride_id = $1", [rideId]);
    if (!payment) return null
    return Payment.restore(payment.payment_id, payment.ride_id, Number(payment.amount), payment.date, payment.status) 
  }
}
