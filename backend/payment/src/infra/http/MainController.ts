import Registry from "../../Registry"
import { HttpServer } from "./HttpServer"

export default class MainController {
  constructor(readonly httpServer: HttpServer) {
    const registry = Registry.getInstance()
    httpServer.register("post", '/process_payment', async (params, body, query) => registry.inject('processPayment').execute(body))
    httpServer.register("get", '/get_payment', async (params, body, query) => registry.inject('getPayment').execute(query.rideId))
    httpServer.listen(3002)
  }
}

