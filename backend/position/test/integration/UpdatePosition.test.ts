import GetPositions from "../../src/application/usecase/GetPositions";
import UpdatePosition from "../../src/application/usecase/UpdatePosition"
import { DataBaseConnection } from "../../src/infra/database/DataBaseConnection"
import PostgresDataBase from "../../src/infra/database/PostgresDataBase"
import { PositionRepositoryDatabase } from "../../src/infra/repository/PositionRepository";
import crypto from "crypto";

let database: DataBaseConnection
let updatePosition: UpdatePosition
let getPositions: GetPositions

beforeEach(() => {
  database = new PostgresDataBase()
  const positionRepository = new PositionRepositoryDatabase(database)
  updatePosition = new UpdatePosition(positionRepository)  
  getPositions = new GetPositions(positionRepository)
})

afterEach(async () => {
  await database.close()
})

test('Deve salvar a posição com sucesso', async () => {
  const updatePositionInput = {
    rideId: crypto.randomUUID(),
    lat: -27.496887588317275,
		long: -48.522234807851476
  }
  await updatePosition.execute(updatePositionInput)
  const [position] = await getPositions.execute(updatePositionInput.rideId)
  expect(position.positionId).toBeDefined()
  expect(position.rideId).toBe(updatePositionInput.rideId)
  expect(position.lat).toBe(updatePositionInput.lat)
  expect(position.long).toBe(updatePositionInput.long)
})

test('Deve lançar erro se não encontrar posição', async () => {
  const positionId = crypto.randomUUID()
  await expect(getPositions.execute(positionId)).rejects.toThrow(new Error('Positions not found'))
})
