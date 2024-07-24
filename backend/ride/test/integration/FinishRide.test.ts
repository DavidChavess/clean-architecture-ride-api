import AcceptRide from "../../src/application/usecase/AcceptRide"
import FinishRide from "../../src/application/usecase/FinishRide"
import GetRide from "../../src/application/usecase/GetRide"
import RequestRide from "../../src/application/usecase/RequestRide"
import StartRide from "../../src/application/usecase/StartRide"
import UpdatePosition from "../../src/application/usecase/UpdatePosition"
import PostgresDataBase from "../../src/infra/database/PostgresDataBase"
import { AccountGateway, AccountGatewayHttp } from "../../src/infra/gateway/AccountGatewayHttp"
import { RideRepositoryDatabase } from "../../src/infra/repository/RideRepository"
import crypto from 'crypto'
import RabbitMqEventAdapter from "../../src/infra/event/RabbitMqEventAdapter"
import { advanceTo, clear } from 'jest-date-mock'

let database: PostgresDataBase
let accountGateway: AccountGateway
let requestRide: RequestRide
let acceptRide: AcceptRide
let startRide: StartRide
let finishRide: FinishRide
let getRide: GetRide
let updatePosition: UpdatePosition
let rabbitMqAdapter: RabbitMqEventAdapter

beforeEach(async () => {
  rabbitMqAdapter = new RabbitMqEventAdapter()
  await rabbitMqAdapter.connect()
  database = new PostgresDataBase()
  database.connect()
  const rideRepository = new RideRepositoryDatabase(database)
  accountGateway = new AccountGatewayHttp()
  requestRide = new RequestRide(rideRepository, accountGateway, rabbitMqAdapter)
  acceptRide = new AcceptRide(accountGateway, rideRepository, rabbitMqAdapter)
  startRide = new StartRide(rideRepository, rabbitMqAdapter)
  getRide = new GetRide(rideRepository, accountGateway)
  updatePosition = new UpdatePosition(rideRepository, rabbitMqAdapter) 
  finishRide = new FinishRide(rideRepository, rabbitMqAdapter)
})

afterEach(async () => {
  await database.close()
  await rabbitMqAdapter.close()
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

test('Deve finalizar corrida em horario normal', async () => {
  advanceTo(new Date("2024-02-26T16:00:00-03:00"));
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
  clear()
})

test('Deve finalizar corrida em horario noturno', async () => {
  advanceTo(new Date("2024-02-26T23:00:00-03:00"));
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
  expect(getRideOutput.fare).toBe(39)
  clear()
})