import AcceptRide from "../../src/application/usecase/AcceptRide";
import GetRide from "../../src/application/usecase/GetRide";
import RequestRide from "../../src/application/usecase/RequestRide";
import StartRide from "../../src/application/usecase/StartRide";
import UpdatePosition from "../../src/application/usecase/UpdatePosition"
import { DataBaseConnection } from "../../src/infra/database/DataBaseConnection"
import PostgresDataBase from "../../src/infra/database/PostgresDataBase"
import RabbitMqEventAdapter from "../../src/infra/event/RabbitMqEventAdapter";
import { AccountGateway, AccountGatewayHttp } from "../../src/infra/gateway/AccountGatewayHttp";
import { PositionGateway, PositionGatewayHttp } from "../../src/infra/gateway/PositionGatewayHttp";
import { RideRepositoryDatabase } from "../../src/infra/repository/RideRepository"
import crypto from "crypto";

let database: DataBaseConnection
let updatePosition: UpdatePosition
let requestRide: RequestRide
let acceptRide: AcceptRide
let startRide: StartRide
let getRide: GetRide
let accountGateway: AccountGateway
let eventEmitter: RabbitMqEventAdapter
let positionsGateway: PositionGateway

beforeEach(async () => {
  eventEmitter = new RabbitMqEventAdapter()
  await eventEmitter.connect()
  database = new PostgresDataBase()
  const rideRepository = new RideRepositoryDatabase(database)
  accountGateway = new AccountGatewayHttp()
  updatePosition = new UpdatePosition(rideRepository, eventEmitter)  
  requestRide = new RequestRide(rideRepository, accountGateway)
  acceptRide = new AcceptRide(accountGateway, rideRepository)
  startRide = new StartRide(rideRepository)
  getRide = new GetRide(rideRepository, accountGateway)
  positionsGateway = new PositionGatewayHttp()
})

afterEach(async () => {
  await database.close()
  await eventEmitter.close()
})

test('Deve verificar se a corrida esta com status in_progress', async () => {
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
  const input = {
    rideId,
    lat: 34.34,
    long: 435454
  }
  await expect(updatePosition.execute(input)).rejects.toThrow(new Error("The ride was not in_progress"))
})

test('Deve verificar se a corrida existe', async () => {
  const rideId = crypto.randomUUID()
  const input = {
    rideId,
    lat: 34.34,
    long: 43.5454
  }
  await expect(updatePosition.execute(input)).rejects.toThrow(new Error("Ride not found"))
})

test('Deve salvar a posição com sucesso', async () => {
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
  const getRideOutput = await getRide.execute(rideId)
  expect(getRideOutput.distance).toBe(10)
  expect(getRideOutput.lastLat).toBe(updatePositionInput.lat)
  expect(getRideOutput.lastLong).toBe(updatePositionInput.long)
  const positions = await positionsGateway.getByRideId(rideId)
  expect(positions).toBeDefined()
  const position = positions!![0]
  expect(position.positionId).toBeDefined()
  expect(position.rideId).toBe(updatePositionInput.rideId)
  expect(position.lat).toBe(updatePositionInput.lat)
  expect(position.long).toBe(updatePositionInput.long)
})
