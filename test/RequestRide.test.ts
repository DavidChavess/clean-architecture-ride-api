import { AccountRepositoryDatabase } from "../src/infra/repository/AccountReposity"
import { RideAccountNotFoundException } from "../src/exception/RideAccountNotFoundException"
import GetRide from "../src/application/usecase/GetRide"
import RequestRide from "../src/application/usecase/RequestRide"
import { RideRepositoryDatabase } from "../src/infra/repository/RideRepository"
import crypto from 'crypto'
import Signup from "../src/application/usecase/Signup"
import { DataBaseConnection } from "../src/infra/database/DataBaseConnection"
import PostgresDataBase from "../src/infra/database/PostgresDataBase"

let database: DataBaseConnection
let rideRepository: RideRepositoryDatabase
let accountRepository: AccountRepositoryDatabase
let signup: Signup
let getRide: GetRide
let requestRide: RequestRide

beforeEach(() => {
  database = new PostgresDataBase()
  rideRepository = new RideRepositoryDatabase(database)
  accountRepository = new AccountRepositoryDatabase(database)
  signup = new Signup(accountRepository)
  getRide = new GetRide(rideRepository, accountRepository)
  requestRide = new RequestRide(rideRepository, accountRepository)
})

afterEach(async () => {
  await database.close()
})

test('Deve solicitar corrida por um passgeiro', async () => {
  const passenger = {
    name: 'Fulano Tal',
    email: `input${Math.random()}@gmail.com`,
    cpf: '97456321558',
    isPassenger: true,
    isDriver: false
  }
  const { accountId } = await signup.execute(passenger)
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
  await expect(requestRide.execute(input)).rejects.toThrow(new RideAccountNotFoundException())
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
  const { accountId } = await signup.execute(inputAccount)
  const input = {
    passengerId: accountId,
    fromLat: -21.3750678,
    fromLong: -48.2409842,
    toLat: -21.3628963,
    toLong: -48.2461194
  }
  await expect(requestRide.execute(input)).rejects.toThrow(new Error("A conta não é de um passageiro"))
})

test('Deve validar se existe corridas pendentes', async () => {
  const inputAccount = {
    name: 'Fulano Tal',
    email: `input${Math.random()}@gmail.com`,
    cpf: '97456321558',
    isPassenger: true,
    isDriver: false
  }
  const { accountId } = await signup.execute(inputAccount)
  const input = {
    passengerId: accountId,
    fromLat: -21.3750678,
    fromLong: -48.2409842,
    toLat: -21.3628963,
    toLong: -48.2461194
  }
  await requestRide.execute(input)
  await expect(requestRide.execute(input)).rejects.toThrow(new Error("Existem corridas pendentes"))
})