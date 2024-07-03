import crypto from 'crypto'
import { DataBaseConnection } from "../../src/infra/database/DataBaseConnection"
import PostgresDataBase from "../../src/infra/database/PostgresDataBase"
import ProcessPayment from '../../src/application/usecase/ProcessPayment'
import { PaymentRepositoryDatabase } from '../../src/infra/repository/PaymentRepository'
import GetPayment from '../../src/application/usecase/GetPayment'

let database: DataBaseConnection
let processPayment: ProcessPayment
let getPayment: GetPayment

beforeEach(() => {
  database = new PostgresDataBase()
  const paymentRepository = new PaymentRepositoryDatabase(database)
  processPayment = new ProcessPayment(paymentRepository)  
  getPayment = new GetPayment(paymentRepository)
})

afterEach(async () => {
  await database.close()
})

test('Deve processar pagamento', async () => {
  const input = { 
    rideId: crypto.randomUUID(),
    creditCardToken: 'any',
    amount: 0
  }
  await processPayment.execute(input)
  const getPaymentOutput = await getPayment.execute(input.rideId)
  expect(getPaymentOutput.paymentId).toBeDefined()
  expect(getPaymentOutput.rideId).toBe(input.rideId)
  expect(getPaymentOutput.amount).toBe(input.amount)
  expect(getPaymentOutput.status).toBe('success')
})
