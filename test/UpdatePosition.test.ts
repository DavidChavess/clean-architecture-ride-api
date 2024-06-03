import UpdatePosition from "../src/application/usecase/UpdatePosition"
import { DataBaseConnection } from "../src/infra/database/DataBaseConnection"
import PostgresDataBase from "../src/infra/database/PostgresDataBase"
import { PositionRepository, PositionRepositoryDatabase } from "../src/infra/repository/PositionRepository";
import RideRepository, { RideRepositoryDatabase } from "../src/infra/repository/RideRepository"
import crypto from "crypto";

let database: DataBaseConnection
let rideRepository: RideRepository
let positionRepository: PositionRepository
let updatePosition: UpdatePosition

beforeEach(() => {
  database = new PostgresDataBase()
  rideRepository = new RideRepositoryDatabase(database)
  positionRepository = new PositionRepositoryDatabase(database)
  updatePosition = new UpdatePosition(rideRepository, positionRepository)  
})

afterEach(async () => {
  await database.close()
})

test('Deve verificar se a corrida esta com status in_progress', async () => {
  const rideId = crypto.randomUUID()
  const input = {
    rideId,
    lat: 3434,
    long: 435454
  }
  await database.query("insert into cccat15.ride (ride_id, status) values ($1, $2)", [rideId, 'requested'])
  await expect(updatePosition.execute(input)).rejects.toThrow(new Error("Corrida deve estar com status: em progresso"))
})

test('Deve verificar se a corrida existe', async () => {
  const rideId = crypto.randomUUID()
  const input = {
    rideId,
    lat: 3434,
    long: 435454
  }
  await expect(updatePosition.execute(input)).rejects.toThrow(new Error("Corrida não encontrada"))
})

test('Deve salvar a posição com sucesso', async () => {
  const rideId = crypto.randomUUID()
  const input = {
    rideId,
    lat: 3434,
    long: 435454
  }
  await database.query("insert into cccat15.ride (ride_id, status) values ($1, $2)", [rideId, 'in_progress'])
  await updatePosition.execute(input)
  const [position] = await database.query("select * from cccat15.position where ride_id = $1", [rideId])
  expect(position).toBeDefined()
  expect(position.position_id).toBeDefined()
  expect(position.ride_id).toBe(input.rideId)
  expect(position.lat).toBe(input.lat.toString())
  expect(position.long).toBe(input.long.toString())
})
