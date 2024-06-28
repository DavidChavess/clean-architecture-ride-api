import Signup from "./application/usecase/Signup"
import { AccountRepositoryDatabase } from "./infra/repository/AccountRepository"
import GetAccount from "./application/usecase/GetAccount"
import PostgresDataBase from "./infra/database/PostgresDataBase"
import ExpressAdapter from "./infra/http/ExpressAdapter"
import MainController from "./infra/http/MainController"
import Registry from "./Registry"

const database = new PostgresDataBase()
const accountRepository = new AccountRepositoryDatabase(database)
const signup = new Signup(accountRepository)
const getAccount = new GetAccount(accountRepository)
const registry = Registry.getInstance()
registry.registry('signup', signup)
registry.registry('getAccount', getAccount)
const expressAdapter = new ExpressAdapter()
new MainController(expressAdapter)
