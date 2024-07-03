import GetPayment from "./application/usecase/GetPayment"
import ProcessPayment from "./application/usecase/ProcessPayment"
import PostgresDataBase from "./infra/database/PostgresDataBase"
import EventController from "./infra/event/EventController"
import RabbitMqEventAdapter from "./infra/event/connection/RabbitMqEventAdapter"
import { PaymentRepositoryDatabase } from "./infra/repository/PaymentRepository"
import Registry from "./Registry"

const database = new PostgresDataBase()
const paymentRepository = new PaymentRepositoryDatabase(database)
const processPayment = new ProcessPayment(paymentRepository)
const getPayment = new GetPayment(paymentRepository)
const registry = Registry.getInstance()
registry.registry('processPayment', processPayment)
registry.registry('getPayment', getPayment)
const rabbitmq = new RabbitMqEventAdapter()
new EventController(rabbitmq).execute()
