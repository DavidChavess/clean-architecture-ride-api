import { AccountDAODatabase } from "../src/AccountDAO"
import { RideAccountNotFoundException } from "../src/exception/RideAccountNotFoundException"
import GetRide from "../src/GetRide"
import Ride, { RideInput } from "../src/Ride"
import { RideDAODatabase } from "../src/RideDao"
import crypto from 'crypto'
import Signup, { SignupInput } from "../src/Signup"

test('Deve solicitar corrida por um passgeiro', async () => {
  const passenger: SignupInput = {
    name: 'Fulano Tal',
    email: `input${Math.random()}@gmail.com`,
    cpf: '97456321558',
    isPassenger: true
  }
  const rideDao = new RideDAODatabase()
  const accountDao = new AccountDAODatabase()
  const signup = new Signup(accountDao)
  const { accountId } = await signup.execute(passenger)
  const ride = new Ride(rideDao, accountDao)
  const input: RideInput = {
    accountId,
    fromLat: 454512,
    fromLong: 45588,
    toLat: 45545455,
    toLong: 4545455
  }
  const rideOutput = await ride.execute(input)
  const getRide = new GetRide(rideDao)
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
  const rideDao = new RideDAODatabase()
  const getRide = new GetRide(rideDao)
  const getRideOutput = await getRide.execute(crypto.randomUUID())
  expect(getRideOutput).not.toBeTruthy()
})

test('Deve validar se a conta existe', async () => {
  const input: RideInput = {
    accountId: crypto.randomUUID(),
    fromLat: 454512,
    fromLong: 45588,
    toLat: 45545455,
    toLong: 4545455
  }
  const rideDao = new RideDAODatabase()
  const accountDao = new AccountDAODatabase()
  const ride = new Ride(rideDao, accountDao)
  await expect(ride.execute(input)).rejects.toThrow(new RideAccountNotFoundException())
})

test('Deve validar se a conta é de um passageiro', async () => {
  const inputAccount: SignupInput = {
    name: 'Fulano Tal',
    email: `input${Math.random()}@gmail.com`,
    cpf: '97456321558'
  }
  const accountDao = new AccountDAODatabase()
  const signup = new Signup(accountDao)
  const { accountId } = await signup.execute(inputAccount)
  const input: RideInput = {
    accountId,
    fromLat: 454512,
    fromLong: 45588,
    toLat: 45545455,
    toLong: 4545455
  }
  const rideDao = new RideDAODatabase()
  const ride = new Ride(rideDao, accountDao)
  await expect(ride.execute(input)).rejects.toThrow(new Error("A conta não é de um passageiro"))
})

test('Deve validar se existe corridas pendentes', async () => {
  const inputAccount: SignupInput = {
    name: 'Fulano Tal',
    email: `input${Math.random()}@gmail.com`,
    cpf: '97456321558',
    isPassenger: true
  }
  const accountDao = new AccountDAODatabase()
  const signup = new Signup(accountDao)
  const { accountId } = await signup.execute(inputAccount)
  const input: RideInput = {
    accountId,
    fromLat: 454512,
    fromLong: 45588,
    toLat: 45545455,
    toLong: 4545455
  }
  const rideDao = new RideDAODatabase()
  const ride = new Ride(rideDao, accountDao)
  await ride.execute(input)
  await expect(ride.execute(input)).rejects.toThrow(new Error("Existem corridas pendentes"))
})