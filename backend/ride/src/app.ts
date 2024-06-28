import RequestRide from "./application/usecase/RequestRide"
import { RideRepositoryDatabase } from "./infra/repository/RideRepository"
import GetRide from "./application/usecase/GetRide"
import PostgresDataBase from "./infra/database/PostgresDataBase"
import ExpressAdapter from "./infra/http/ExpressAdapter"
import MainController from "./infra/http/MainController"
import Registry from "./Registry"
import { AccountGatewayHttp } from "./infra/gateway/AccountGatewayHttp"

const database = new PostgresDataBase()
const rideRepository = new RideRepositoryDatabase(database)
const accountGatewayHttp = new AccountGatewayHttp()
const requestRide = new RequestRide(rideRepository, accountGatewayHttp)
const getRide = new GetRide(rideRepository, accountGatewayHttp)
const registry = Registry.getInstance()
registry.registry('getRide', getRide)
registry.registry('requestRide', requestRide)
const expressAdapter = new ExpressAdapter()
new MainController(expressAdapter)
