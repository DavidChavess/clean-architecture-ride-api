import AcceptRide from "../../src/application/usecase/AcceptRide"
import FinishRide from "../../src/application/usecase/FinishRide"
import GetRide from "../../src/application/usecase/GetRide"
import RequestRide from "../../src/application/usecase/RequestRide"
import StartRide from "../../src/application/usecase/StartRide"
import UpdatePosition from "../../src/application/usecase/UpdatePosition"
import PostgresDataBase from "../../src/infra/database/PostgresDataBase"
import { AccountGateway, AccountGatewayHttp } from "../../src/infra/gateway/AccountGatewayHttp"
import { PositionRepositoryDatabase } from "../../src/infra/repository/PositionRepository"
import { RideRepositoryDatabase } from "../../src/infra/repository/RideRepository"
import crypto from 'crypto'
import RabbitMqEventAdapter from "../../src/infra/event/RabbitMqEventAdapter"
import { PaymentGateway, PaymentGatewayHttp } from "../../src/infra/gateway/PaymentGatewayHttp"

let database: PostgresDataBase
let accountGateway: AccountGateway
let requestRide: RequestRide
let acceptRide: AcceptRide
let startRide: StartRide
let finishRide: FinishRide
let getRide: GetRide
let updatePosition: UpdatePosition
let eventEmitter: RabbitMqEventAdapter
let paymentGateway: PaymentGateway

beforeEach(async () => {
  database = new PostgresDataBase()
  const rideRepository = new RideRepositoryDatabase(database)
  const positionRepository = new PositionRepositoryDatabase(database)
  accountGateway = new AccountGatewayHttp()
  requestRide = new RequestRide(rideRepository, accountGateway)
  acceptRide = new AcceptRide(accountGateway, rideRepository)
  startRide = new StartRide(rideRepository)
  getRide = new GetRide(rideRepository, accountGateway)
  updatePosition = new UpdatePosition(rideRepository, positionRepository) 
  eventEmitter = new RabbitMqEventAdapter()
  await eventEmitter.connect()
  finishRide = new FinishRide(rideRepository, eventEmitter)
  paymentGateway = new PaymentGatewayHttp()
})

afterEach(async () => {
  await database.close()
  await eventEmitter.close()
})


test('Deve verificar se existe corrida para a rideId informada', async () => {
  const rideId = crypto.randomUUID()
  await expect(finishRide.execute(rideId)).rejects.toThrow(new Error("Ride not found"))
})

test('Deve verificar se corrida esta com status em progresso', async () => {
  const passengerInput = {
    name: 'Fulano Tal',
    email: `input${Math.random()}@gmail.com`,
    cpf: '97456321558',
    isPassenger: true,
    isDriver: false
  }
  const passengerOutput = await accountGateway.signup(passengerInput)
  const requestRideInput = {
    passengerId: passengerOutput.accountId,
    fromLat: -21.3750678,
    fromLong: -48.2409842,
    toLat: -21.3628963,
    toLong: -48.2461194
  }
  const { rideId } = await requestRide.execute(requestRideInput)
  await expect(finishRide.execute(rideId)).rejects.toThrow(new Error("The ride was not in_progress"))
})

test('Deve finalizar corrida', async () => {
  const passengerInput = {
    name: 'Fulano Tal',
    email: `input${Math.random()}@gmail.com`,
    cpf: '97456321558',
    isPassenger: true,
    isDriver: false
  }
  const passengerOutput = await accountGateway.signup(passengerInput)
  const driverInput = {
    name: 'Fulano Tal',
    email: `input${Math.random()}@gmail.com`,
    cpf: '97456321558',
    isPassenger: true,
    isDriver: true,
    carPlate: 'SSF8955'
  }
  const driverOutput = await accountGateway.signup(driverInput)
  const requestRideInput = {
    passengerId: passengerOutput.accountId,
    fromLat: -27.584905257808835,
		fromLong: -48.545022195325124,
		toLat: -27.496887588317275,
		toLong: -48.522234807851476
  }
  const { rideId } = await requestRide.execute(requestRideInput)
  const acceptRideInput = { 
    rideId,
    driverId: driverOutput.accountId
  }
  await acceptRide.execute(acceptRideInput)
  await startRide.execute(rideId)
  const updatePositionInput = {
    rideId,
    lat: -27.496887588317275,
		long: -48.522234807851476
  }
  await updatePosition.execute(updatePositionInput)
  await finishRide.execute(rideId)
  const getRideOutput = await getRide.execute(rideId)
  expect(getRideOutput.status).toBe('completed')
  expect(getRideOutput.fare).toBe(21)
  const getPaymentOutput = await paymentGateway.getByRideId(rideId)
  expect(getPaymentOutput.paymentId).toBeDefined()
  expect(getPaymentOutput.rideId).toBe(rideId)
  expect(getPaymentOutput.amount).toBe(getRideOutput.fare)
  expect(getPaymentOutput.status).toBe('success')
})