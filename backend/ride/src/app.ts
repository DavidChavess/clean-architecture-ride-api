import RequestRide from "./application/usecase/RequestRide"
import { RideRepositoryDatabase } from "./infra/repository/RideRepository"
import GetRide from "./application/usecase/GetRide"
import PostgresDataBase from "./infra/database/PostgresDataBase"
import ExpressAdapter from "./infra/http/ExpressAdapter"
import MainController from "./infra/http/MainController"
import Registry from "./Registry"
import { AccountGatewayHttp } from "./infra/gateway/AccountGatewayHttp"
import RabbitMqEventAdapter from "./infra/event/RabbitMqEventAdapter"
import UpdateRideProjection from "./application/query/UpdateRideProjection"
import MongoDataBase from "./infra/database/MongoDataBase"
import EventController from "./infra/event/EventController"

async function main() {
  const database = new PostgresDataBase()
  await database.connect()
  const mongoDbDatabase = new MongoDataBase()
  await mongoDbDatabase.connect() 
  const rabbitMqAdapter = new RabbitMqEventAdapter()
  await rabbitMqAdapter.connect()
  const rideRepository = new RideRepositoryDatabase(database)
  const accountGatewayHttp = new AccountGatewayHttp()
  const requestRide = new RequestRide(rideRepository, accountGatewayHttp, rabbitMqAdapter)
  const getRide = new GetRide(rideRepository, accountGatewayHttp)
  const updateRideProjection = new UpdateRideProjection(mongoDbDatabase)
  const registry = Registry.getInstance()
  registry.registry('updateRideProjection', updateRideProjection)
  registry.registry('getRide', getRide)
  registry.registry('requestRide', requestRide)
  const expressAdapter = new ExpressAdapter()
  new MainController(expressAdapter)
  new EventController(rabbitMqAdapter).execute()
}

main()
