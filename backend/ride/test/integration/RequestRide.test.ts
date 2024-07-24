import GetRide from "../../src/application/usecase/GetRide"
import RequestRide from "../../src/application/usecase/RequestRide"
import { RideRepositoryDatabase } from "../../src/infra/repository/RideRepository"
import crypto from 'crypto'
import { DataBaseConnection } from "../../src/infra/database/DataBaseConnection"
import PostgresDataBase from "../../src/infra/database/PostgresDataBase"
import { AccountGateway, AccountGatewayHttp } from "../../src/infra/gateway/AccountGatewayHttp"
import RabbitMqEventAdapter from "../../src/infra/event/RabbitMqEventAdapter"

let database: DataBaseConnection
let rideRepository: RideRepositoryDatabase
let accountGateway: AccountGateway
let getRide: GetRide
let requestRide: RequestRide
let rabbitMqAdapter: RabbitMqEventAdapter

beforeEach(async () => {
  database = new PostgresDataBase()
  await database.connect()
  rabbitMqAdapter = new RabbitMqEventAdapter()
  await rabbitMqAdapter.connect()
  rideRepository = new RideRepositoryDatabase(database)
  accountGateway = new AccountGatewayHttp()
  getRide = new GetRide(rideRepository, accountGateway)
  requestRide = new RequestRide(rideRepository, accountGateway, rabbitMqAdapter)
})

afterEach(async () => {
  await database.close()
  await rabbitMqAdapter.close()
})

test('Deve solicitar corrida por um passgeiro e buscar todos os dados da corrida', async () => {
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
  const rideOutput = await requestRide.execute(input)
  const getRideOutput = await getRide.execute(rideOutput.rideId)
  expect(getRideOutput.rideId).toBe(rideOutput.rideId)
  expect(getRideOutput.fromLat).toBe(input.fromLat)
  expect(getRideOutput.fromLong).toBe(input.fromLong)
  expect(getRideOutput.toLat).toBe(input.toLat)
  expect(getRideOutput.toLong).toBe(input.toLong)
  expect(getRideOutput.passenger.accountId).toBe(accountId)
  expect(getRideOutput.passenger.name).toBe(passenger.name)
  expect(getRideOutput.lastLat).toBe(input.fromLat)
  expect(getRideOutput.lastLong).toBe(input.fromLong)
  expect(getRideOutput.distance).toBe(0)
  expect(getRideOutput.status).toBe("requested")
  expect(getRideOutput.date).toBeDefined()
})

test('Deve lançar erro se a corrida não existir', async () => {
  await expect(getRide.execute(crypto.randomUUID())).rejects.toThrow(new Error("Ride not found"))
})

test('Deve validar se a conta existe', async () => {
  const input = {
    passengerId: crypto.randomUUID(),
    fromLat: -21.3750678,
    fromLong: -48.2409842,
    toLat: -21.3628963,
    toLong: -48.2461194
  }
  await expect(requestRide.execute(input)).rejects.toThrow(new Error("To create a ride, it's necessary that the account exists."))
})

test('Deve validar se a conta é de um passageiro', async () => {
  const inputAccount = {
    name: 'Fulano Tal',
    email: `input${Math.random()}@gmail.com`,
    cpf: '97456321558',
    isPassenger: false,
    isDriver: true,
    carPlate: 'SHIK8952'
  }
  const { accountId } = await accountGateway.signup(inputAccount)
  const input = {
    passengerId: accountId,
    fromLat: -21.3750678,
    fromLong: -48.2409842,
    toLat: -21.3628963,
    toLong: -48.2461194
  }
  await expect(requestRide.execute(input)).rejects.toThrow(new Error("The account is not a passenger"))
})

test('Deve validar se existe corridas pendentes', async () => {
  const inputAccount = {
    name: 'Fulano Tal',
    email: `input${Math.random()}@gmail.com`,
    cpf: '97456321558',
    isPassenger: true,
    isDriver: false
  }
  const { accountId } = await accountGateway.signup(inputAccount)
  const input = {
    passengerId: accountId,
    fromLat: -21.3750678,
    fromLong: -48.2409842,
    toLat: -21.3628963,
    toLong: -48.2461194
  }
  await requestRide.execute(input)
  await expect(requestRide.execute(input)).rejects.toThrow(new Error("It was not possible to request the ride because there are pending rides from the passenger"))
})