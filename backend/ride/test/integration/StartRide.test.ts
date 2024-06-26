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

let dataBaseConnection: DataBaseConnection
let rideRepository: RideRepository
let accountGateway: AccountGateway
let startRide: StartRide
let requestRide: RequestRide
let getRide: GetRide
let acceptRide: AcceptRide

beforeEach(() => {
  dataBaseConnection = new PostgresDataBase()
  rideRepository = new RideRepositoryDatabase(dataBaseConnection)
  startRide = new StartRide(rideRepository)
  accountGateway = new AccountGatewayHttp()
  requestRide = new RequestRide(rideRepository, accountGateway)
  getRide = new GetRide(rideRepository, accountGateway)
  acceptRide = new AcceptRide(accountGateway, rideRepository)
})

afterEach(async () => {
  await dataBaseConnection.close()
})

test('Deve chamar rideReposiroty para buscar corrida ', async () => {
  const rideRepository = new StartRideRepositoryMock()
  const startRide = new StartRide(rideRepository)
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
  const getRideOutput = await getRide.execute(rideId)
  expect(getRideOutput.status).toBe("in_progress")
})