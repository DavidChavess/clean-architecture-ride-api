import GetPositions from "./application/usecase/GetPositions"
import UpdatePosition from "./application/usecase/UpdatePosition"
import PostgresDataBase from "./infra/database/PostgresDataBase"
import ExpressAdapter from "./infra/http/ExpressAdapter"
import MainController from "./infra/http/MainController"
import { PositionRepositoryDatabase } from "./infra/repository/PositionRepository"
import Registry from "./Registry"

const database = new PostgresDataBase()
const positionRepository = new PositionRepositoryDatabase(database)
const updatePosition = new UpdatePosition(positionRepository)
const getPositions = new GetPositions(positionRepository)
const registry = Registry.getInstance()
registry.registry('updatePosition', updatePosition)
registry.registry('getPositions', getPositions)
const expressAdapter = new ExpressAdapter()
new MainController(expressAdapter)
