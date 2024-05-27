import Signup from "./Signup"
import { AccountRepositoryDatabase } from "./AccountReposity"
import GetAccount from "./GetAccount"
import RequestRide from "./RequestRide"
import { RideRepositoryDatabase } from "./RideRepository"
import GetRide from "./GetRide"
import PostgresDataBase from "./PostgresDataBase"
import ExpressAdapter from "./ExpressAdapter"
import MainController from "./MainController"

const database = new PostgresDataBase()
const accountRepository = new AccountRepositoryDatabase(database)
const rideRepository = new RideRepositoryDatabase(database)
const signup = new Signup(accountRepository)
const getAccount = new GetAccount(accountRepository)
const requestRide = new RequestRide(rideRepository, accountRepository)
const getRide = new GetRide(rideRepository, accountRepository)
const expressAdapter = new ExpressAdapter()
new MainController(expressAdapter, signup, getAccount, getRide, requestRide)
