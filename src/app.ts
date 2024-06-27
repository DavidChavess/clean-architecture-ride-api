import Signup from "./application/usecase/Signup"
import { AccountRepositoryDatabase } from "./infra/repository/AccountRepository"
import GetAccount from "./application/usecase/GetAccount"
import RequestRide from "./application/usecase/RequestRide"
import { RideRepositoryDatabase } from "./infra/repository/RideRepository"
import GetRide from "./application/usecase/GetRide"
import PostgresDataBase from "./infra/database/PostgresDataBase"
import ExpressAdapter from "./infra/http/ExpressAdapter"
import MainController from "./infra/http/MainController"
import Registry from "./Registry"

const database = new PostgresDataBase()
const accountRepository = new AccountRepositoryDatabase(database)
const rideRepository = new RideRepositoryDatabase(database)
const signup = new Signup(accountRepository)
const getAccount = new GetAccount(accountRepository)
const requestRide = new RequestRide(rideRepository, accountRepository)
const getRide = new GetRide(rideRepository, accountRepository)
const registry = Registry.getInstance()
registry.registry('signup', signup)
registry.registry('getAccount', getAccount)
registry.registry('getRide', getRide)
registry.registry('requestRide', requestRide)
const expressAdapter = new ExpressAdapter()
new MainController(expressAdapter)
