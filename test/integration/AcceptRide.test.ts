import AcceptRide from "../../src/application/usecase/AcceptRide"
import Signup from "../../src/application/usecase/Signup"
import PostgresDataBase from "../../src/infra/database/PostgresDataBase"
import { AccountRepositoryDatabase } from "../../src/infra/repository/AccountRepository"
import { AccountRepositoryMock } from "../mock/AccountReposirotyMock"
import crypto from 'crypto'
import { RequestRideRepositoryMock } from "../mock/RequestRideRepositoryMock"
import { RideRepositoryDatabase } from "../../src/infra/repository/RideRepository"
import GetRide from "../../src/application/usecase/GetRide"

let database: PostgresDataBase
let signup: Signup
let getRide: GetRide
let acceptRide: AcceptRide

describe('Testes chamando os recursos reais', () => {
  let accountRepository: AccountRepositoryDatabase
  let rideRepository: RideRepositoryDatabase

  beforeEach(async () => {
    database = new PostgresDataBase()
    accountRepository = new AccountRepositoryDatabase(database)
    rideRepository = new RideRepositoryDatabase(database)
    signup = new Signup(accountRepository)
    getRide = new GetRide(rideRepository, accountRepository)
    acceptRide = new AcceptRide(accountRepository, rideRepository)
  })

  afterEach(async () => {
    await database.close()
  })

  test('Deve lançar erro se a conta do motorista não existir', async () => {
    const input = {
      driverId: crypto.randomUUID(),
      rideId: crypto.randomUUID()
    }
    await expect(acceptRide.execute(input)).rejects.toThrow(new Error('Driver not found'))
  })

  test('Deve lançar erro se a conta não for de um motorista', async () => {
    const passenger = {
      name: 'Fulano Tal',
      email: `input${Math.random()}@gmail.com`,
      cpf: '97456321558',
      isPassenger: true,
      isDriver: false
    }
    const { accountId } = await signup.execute(passenger)
    expect(accountId).toBeDefined()
    const input = {
      driverId: accountId,
      rideId: crypto.randomUUID()
    }
    await expect(acceptRide.execute(input)).rejects.toThrow(new Error('The account is not a driver'))
  })

  test('Deve lançar erro se a corrida não existir', async () => {
    const driver = {
      name: 'Fulano Tal',
      email: `input${Math.random()}@gmail.com`,
      cpf: '97456321558',
      isPassenger: true,
      isDriver: true,
      carPlate: 'SDF5995'
    }
    const { accountId } = await signup.execute(driver)
    expect(accountId).toBeDefined()
    const input = {
      driverId: accountId,
      rideId: crypto.randomUUID()
    }
    await expect(acceptRide.execute(input)).rejects.toThrow(new Error('Ride not found'))
  })

  test('Deve verificar se o status da corrida é "requested"', async () => {
    const driver = {
      name: 'Fulano Tal',
      email: `input${Math.random()}@gmail.com`,
      cpf: '97456321558',
      isPassenger: true,
      isDriver: true,
      carPlate: 'SDF5995'
    }
    const { accountId } = await signup.execute(driver)
    const driverId = accountId
    const rideId = crypto.randomUUID()
    await database.query("insert into cccat15.ride (ride_id, status) values ($1, $2)", [rideId, 'finished'])
    const input = { driverId, rideId }
    await expect(acceptRide.execute(input)).rejects.toThrow(new Error('The ride was not requested'))
  })

  test.each([
    'accepted',
    'in_progress'
  ])('deve verificar se o motorista já tem outra corrida com status %s', async (status: string) => {
    const driver = {
      name: 'Fulano Tal',
      email: `input${Math.random()}@gmail.com`,
      cpf: '97456321558',
      isPassenger: true,
      isDriver: true,
      carPlate: 'SDF5995'
    }
    const { accountId } = await signup.execute(driver)
    const driverId = accountId
    const rideId = crypto.randomUUID()
    const anyRideId = crypto.randomUUID()
    await database.query("insert into cccat15.ride (ride_id, status) values ($1, $2)", [rideId, 'requested'])
    await database.query("insert into cccat15.ride (ride_id, driver_id, status) values ($1, $2, $3)", [anyRideId, driverId, status])
    const input = { driverId, rideId }
    await expect(acceptRide.execute(input)).rejects.toThrow(new Error('It was not possible to accept the ride because there are pending rides from the driver'))
  })

  test('Deve associar um motorista a corrida com sucesso', async () => {
    const driver = {
      name: 'Fulano Tal',
      email: `input${Math.random()}@gmail.com`,
      cpf: '97456321558',
      isPassenger: true,
      isDriver: true,
      carPlate: 'SDF5995'
    }
    const driverOutput = await signup.execute(driver)
    const passenger = {
      name: 'Passeger Tal',
      email: `input${Math.random()}@gmail.com`,
      cpf: '97456321558',
      isPassenger: true,
      isDriver: false
    }
    const passengerOutput = await signup.execute(passenger)
    const driverId = driverOutput.accountId
    const passengerId = passengerOutput.accountId
    const rideId = crypto.randomUUID()
    await database.query("insert into cccat15.ride (ride_id, passenger_id, status) values ($1, $2, $3)", [rideId, passengerId, 'requested'])
    const input = { 
      driverId, 
      rideId 
    }
    await acceptRide.execute(input)
    const getRideOutput = await getRide.execute(rideId)
    expect(getRideOutput.rideId).toBe(rideId)
    expect(getRideOutput.driver?.accountId).toBe(driverId)
    expect(getRideOutput.driver?.name).toBe(driver.name)
    expect(getRideOutput.status).toBe("accepted")
  })
})

describe('Testes mockando os recursos', () => {
  let rideRepository: RequestRideRepositoryMock
  let accountRepository: AccountRepositoryMock

  beforeEach(async () => {
    rideRepository = new RequestRideRepositoryMock()
    accountRepository = new AccountRepositoryMock()
    acceptRide = new AcceptRide(accountRepository, rideRepository)
  })

  test('Deve chamar accountRepository para buscar um motorista com valores corretos', async () => {
    const input = {
      driverId: 'any_driver_id',
      rideId: 'any_ride_id'
    }
    await acceptRide.execute(input)
    expect(accountRepository.getByIdInput).toBe(input.driverId)
  })

  test('Deve chamar rideRepository para buscar a corrida com valores corretos', async () => {
    const input = {
      driverId: 'any_driver_id',
      rideId: 'any_ride_id'
    }
    await acceptRide.execute(input)
    expect(rideRepository.getRideInput).toBe(input.rideId)
  })

  test('Deve chamar rideRepository para buscar corridas do motorista com status "accepted" ou "in_progress"', async () => {
    const input = {
      driverId: 'any_driver_id',
      rideId: 'any_ride_id'
    }
    await acceptRide.execute(input)
    expect(rideRepository.getRidesByDriverIdAndStatusInInput.driverId).toBe(input.driverId)
    expect(rideRepository.getRidesByDriverIdAndStatusInInput.status).toEqual(['accepted', 'in_progress'])
  })

  test('Deve chamar rideRepository para atualizar corrida', async () => {
    const input = {
      driverId: 'any_driver_id',
      rideId: 'any_ride_id'
    }
    await acceptRide.execute(input)
    expect(rideRepository.updateInput?.rideId).toBe(input.rideId)
    expect(rideRepository.updateInput?.getDriverId()).toBe(input.driverId)
    expect(rideRepository.updateInput?.getStatus()).toBe('accepted')
  })
})