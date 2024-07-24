import GetPayment from "../../src/application/usecase/GetPayment"
import PostgresDataBase from "../../src/infra/database/PostgresDataBase"
import RabbitMqEventAdapter from "../../src/infra/event/connection/RabbitMqEventAdapter"
import { PaymentRepositoryDatabase } from "../../src/infra/repository/PaymentRepository"
import crypto from 'crypto'

let rabbitmq: RabbitMqEventAdapter
let getPayment: GetPayment
let database: PostgresDataBase

beforeEach(async () => {
  rabbitmq = new RabbitMqEventAdapter()
  database = new PostgresDataBase()
  getPayment = new GetPayment(new PaymentRepositoryDatabase(database))
  await rabbitmq.connect()
})

afterEach(async () => {
  await Promise.all([database.close(), rabbitmq.close()])
})

test('Deve processar um evento de pagamento', async () => {
  const input = {
    rideId: crypto.randomUUID(),
    creditCardToken: 'any_credit_token',
    amount: 9.99
  }
  await rabbitmq.send('process_payment', input)
  const getPaymentOutput = await getPayment.execute(input.rideId)
  expect(getPaymentOutput.paymentId).toBeDefined()
  expect(getPaymentOutput.rideId).toBe(input.rideId)
  expect(getPaymentOutput.amount).toBe(input.amount)
  expect(getPaymentOutput.status).toBe('success')
})
