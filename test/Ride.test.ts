import { AccountRepositoryDatabase } from "../src/AccountReposity"
import { RideAccountNotFoundException } from "../src/exception/RideAccountNotFoundException"
import GetRide from "../src/GetRide"
import RequestRide, { RequestRideInput } from "../src/RequestRide"
import { RideDAODatabase } from "../src/RideDAO"
import crypto from 'crypto'
import Signup from "../src/Signup"

let rideDao: RideDAODatabase
let accountRepository: AccountRepositoryDatabase
let signup: Signup
let getRide: GetRide
let requestRide: RequestRide

beforeEach(() => {
  rideDao = new RideDAODatabase()
  accountRepository = new AccountRepositoryDatabase()
  signup = new Signup(accountRepository)
  getRide = new GetRide(rideDao)
  requestRide = new RequestRide(rideDao, accountRepository)
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
  const input: RequestRideInput = {
    accountId,
    fromLat: -21.3750678,
    fromLong: -48.2409842,
    toLat: -21.3628963,
    toLong: -48.2461194
  }
  const rideOutput = await requestRide.execute(input)
  const getRideOrNull = await getRide.execute(rideOutput.rideId)
  const getRideOutput = getRideOrNull!!
  expect(getRideOutput.rideId).toBe(rideOutput.rideId)
  expect(getRideOutput.fromLat).toBe(input.fromLat)
  expect(getRideOutput.fromLong).toBe(input.fromLong)
  expect(getRideOutput.toLat).toBe(input.toLat)
  expect(getRideOutput.toLong).toBe(input.toLong)
  expect(getRideOutput.passenger.accountId).toBe(input.accountId)
  expect(getRideOutput.passenger.cpf).toBe(passenger.cpf)
  expect(getRideOutput.passenger.email).toBe(passenger.email)
  expect(getRideOutput.passenger.name).toBe(passenger.name)
  expect(getRideOutput.status).toBe("requested")
  expect(getRideOutput.date).toBeDefined()
})

test('Deve devolver null se a corrida não existir', async () => {
  const getRideOutput = await getRide.execute(crypto.randomUUID())
  expect(getRideOutput).not.toBeTruthy()
})

test('Deve validar se a conta existe', async () => {
  const input: RequestRideInput = {
    accountId: crypto.randomUUID(),
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
  const input: RequestRideInput = {
    accountId,
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
  const input: RequestRideInput = {
    accountId,
    fromLat: -21.3750678,
    fromLong: -48.2409842,
    toLat: -21.3628963,
    toLong: -48.2461194
  }
  await requestRide.execute(input)
  await expect(requestRide.execute(input)).rejects.toThrow(new Error("Existem corridas pendentes"))
})