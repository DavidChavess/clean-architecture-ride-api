import AcceptRide from "../../src/application/usecase/AcceptRide"
import GetRide from "../../src/application/usecase/GetRide"
import RequestRide from "../../src/application/usecase/RequestRide"
import StartRide from "../../src/application/usecase/StartRide"
import { DataBaseConnection } from "../../src/infra/database/DataBaseConnection"
import PostgresDataBase from "../../src/infra/database/PostgresDataBase"
import RideRepository, { RideRepositoryDatabase } from "../../src/infra/repository/RideRepository"
import crypto from 'crypto'
import { StartRideRepositoryMock } from "../mock/StartRideRepositoryMock"
import { AccountGateway, AccountGatewayHttp } from "../../src/infra/gateway/AccountGatewayHttp"
import RabbitMqEventAdapter from "../../src/infra/event/RabbitMqEventAdapter"
import EventEmitterMock from "../mock/EventEmitterMock"
import GetRideQuery from "../../src/application/query/GetRideQuery"
import MongoDataBase from "../../src/infra/database/MongoDataBase"

let mongodb: MongoDataBase
let dataBaseConnection: DataBaseConnection
let rideRepository: RideRepository
let accountGateway: AccountGateway
let startRide: StartRide
let requestRide: RequestRide
let getRideProjection: GetRideQuery
let acceptRide: AcceptRide
let rabbitMqEventAdapter: RabbitMqEventAdapter

beforeEach(async () => {
  dataBaseConnection = new PostgresDataBase()
  dataBaseConnection.connect()
  rabbitMqEventAdapter = new RabbitMqEventAdapter()
  await rabbitMqEventAdapter.connect()
  rideRepository = new RideRepositoryDatabase(dataBaseConnection)
  startRide = new StartRide(rideRepository, rabbitMqEventAdapter)
  accountGateway = new AccountGatewayHttp()
  requestRide = new RequestRide(rideRepository, accountGateway, rabbitMqEventAdapter)
  mongodb = new MongoDataBase()
  await mongodb.connect()
  getRideProjection = new GetRideQuery(mongodb)
  acceptRide = new AcceptRide(accountGateway, rideRepository, rabbitMqEventAdapter)
})

afterEach(async () => {
  await dataBaseConnection.close()
  await rabbitMqEventAdapter.close()
  await mongodb.close()
})

test('Deve chamar rideReposiroty para buscar corrida ', async () => {
  const rideRepository = new StartRideRepositoryMock()
  const startRide = new StartRide(rideRepository, new EventEmitterMock())
  const rideId = 'any_ride_id'
  await startRide.execute(rideId)
  expect(rideRepository.getRideInput).toBe(rideId)
})

test('Deve lançar erro caso o ride não existir', async () => {
  const rideId = crypto.randomUUID()
  await expect(startRide.execute(rideId)).rejects.toThrow(new Error('Ride not found'))
})

test('Deve verificar se a corrida está em status "accepted"', async () => {
  const passenger = {
    name: 'Fulano Tal',
    email: `input${Math.random()}@gmail.com`,
    cpf: '97456321558',
    isPassenger: true,
    isDriver: false
  }
  const { accountId } = await accountGateway.signup(passenger)
  const input = {
    passengerId: accountId,
    fromLat: -21.3750678,
    fromLong: -48.2409842,
    toLat: -21.3628963,
    toLong: -48.2461194
  }
  const { rideId } = await requestRide.execute(input)
  await expect(startRide.execute(rideId)).rejects.toThrow(new Error('The ride was not accepted'))
})

test('Deve modificar corrida para status "in_progress"', async () => {
  const passengerInput = {
    name: 'Passenger LastName',
    email: `input${Math.random()}@gmail.com`,
    cpf: '97456321558',
    isPassenger: true,
    isDriver: false
  }
  const passengerOutput = await accountGateway.signup(passengerInput)
  const driverInput = {
    name: 'Driver LastName',
    email: `input${Math.random()}@gmail.com`,
    cpf: '97456321558',
    isPassenger: true,
    isDriver: true,
    carPlate: 'SSF8955'
  }
  const driverOutput = await accountGateway.signup(driverInput)
  const requestRideInput = {
    passengerId: passengerOutput.accountId,
    fromLat: -21.3750678,
    fromLong: -48.2409842,
    toLat: -21.3628963,
    toLong: -48.2461194
  }
  const { rideId } = await requestRide.execute(requestRideInput)
  const input = { 
    rideId,
    driverId: driverOutput.accountId
  }
  await acceptRide.execute(input)
  await startRide.execute(rideId)
  const getRideOutput = await getRideProjection.execute(rideId)
  const passenger = { accountId: passengerOutput.accountId, ...passengerInput }
  const driver = { accountId: driverOutput.accountId, ...driverInput }
  expect(getRideOutput.status).toBe("in_progress")
  expect(getRideOutput.rideId).toBe(rideId)
  expect(getRideOutput.fromLat).toBe(requestRideInput.fromLat)
  expect(getRideOutput.fromLong).toBe(requestRideInput.fromLong)
  expect(getRideOutput.toLat).toBe(requestRideInput.toLat)
  expect(getRideOutput.toLong).toBe(requestRideInput.toLong)
  expect(getRideOutput.passenger).toEqual(passenger)
  expect(getRideOutput.driver).toEqual(driver)
  expect(getRideOutput.lastLat).toBe(requestRideInput.fromLat)
  expect(getRideOutput.lastLong).toBe(requestRideInput.fromLong)
  expect(getRideOutput.distance).toBe(0)
  expect(getRideOutput.fare).toBe(0)
  expect(getRideOutput.date).toBeDefined()
})