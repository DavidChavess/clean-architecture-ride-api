import GetRideQuery from "../../src/application/query/GetRideQuery"
import UpdateRideProjection from "../../src/application/query/UpdateRideProjection"
import MongoDataBase from "../../src/infra/database/MongoDataBase"
import crypto from 'crypto'

let database: MongoDataBase
let getRide: GetRideQuery
let updateRideProjection: UpdateRideProjection

beforeEach(async () => {
  database = new MongoDataBase()
  await database.connect()
  updateRideProjection = new UpdateRideProjection(database)
  getRide = new GetRideQuery(database)
})

afterEach(async () => {
  await database.close()
})

test('Deve salvar um projeção', async () => {
  const rideId = crypto.randomUUID()
  const input = {
    rideId,
    lat: 34.34,
    long: 435454
  }
  await updateRideProjection.execute(input)
  const input2 = {
    rideId,
    lat: 60.34,
    names: [
      {
        name: 'David'
      },
      {
        name: 'Maria'
      }
    ]
  }
  await updateRideProjection.execute(input2)
  const getRideOutput = await getRide.execute(input.rideId)
  expect(getRideOutput.rideId).toBe(input.rideId)
  expect(getRideOutput.long).toBe(input.long)
  expect(getRideOutput.lat).toBe(input2.lat)
  expect(getRideOutput.names).toEqual(input2.names)
})