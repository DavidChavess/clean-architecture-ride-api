import AcceptRide from "../../src/application/usecase/AcceptRide";
import GetPositions from "../../src/application/usecase/GetPositions";
import GetRide from "../../src/application/usecase/GetRide";
import RequestRide from "../../src/application/usecase/RequestRide";
import Signup from "../../src/application/usecase/Signup";
import StartRide from "../../src/application/usecase/StartRide";
import UpdatePosition from "../../src/application/usecase/UpdatePosition"
import { DataBaseConnection } from "../../src/infra/database/DataBaseConnection"
import PostgresDataBase from "../../src/infra/database/PostgresDataBase"
import { AccountRepositoryDatabase } from "../../src/infra/repository/AccountRepository";
import { PositionRepositoryDatabase } from "../../src/infra/repository/PositionRepository";
import { RideRepositoryDatabase } from "../../src/infra/repository/RideRepository"
import crypto from "crypto";

let database: DataBaseConnection
let updatePosition: UpdatePosition
let getPositions: GetPositions
let signup: Signup
let requestRide: RequestRide
let acceptRide: AcceptRide
let startRide: StartRide
let getRide: GetRide

beforeEach(() => {
  database = new PostgresDataBase()
  const rideRepository = new RideRepositoryDatabase(database)
  const positionRepository = new PositionRepositoryDatabase(database)
  const accountRepository = new AccountRepositoryDatabase(database)
  updatePosition = new UpdatePosition(rideRepository, positionRepository)  
  getPositions = new GetPositions(positionRepository)
  signup = new Signup(accountRepository)
  requestRide = new RequestRide(rideRepository, accountRepository)
  acceptRide = new AcceptRide(accountRepository, rideRepository)
  startRide = new StartRide(rideRepository)
  getRide = new GetRide(rideRepository, accountRepository)
})

afterEach(async () => {
  await database.close()
})

test('Deve verificar se a corrida esta com status in_progress', async () => {
  const passengerInput = {
    name: 'Fulano Tal',
    email: `input${Math.random()}@gmail.com`,
    cpf: '97456321558',
    isPassenger: true,
    isDriver: false
  }
  const passengerOutput = await signup.execute(passengerInput)
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
  const passengerOutput = await signup.execute(passengerInput)
  const driverInput = {
    name: 'Fulano Tal',
    email: `input${Math.random()}@gmail.com`,
    cpf: '97456321558',
    isPassenger: true,
    isDriver: true,
    carPlate: 'SSF8955'
  }
  const driverOutput = await signup.execute(driverInput)
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
  const [position] = await getPositions.execute(rideId)
  expect(position.positionId).toBeDefined()
  expect(position.rideId).toBe(updatePositionInput.rideId)
  expect(position.lat).toBe(updatePositionInput.lat)
  expect(position.long).toBe(updatePositionInput.long)
})

test('Deve lançar erro se não encontrar posição', async () => {
  const positionId = crypto.randomUUID()
  await expect(getPositions.execute(positionId)).rejects.toThrow(new Error('Positions not found'))
})
