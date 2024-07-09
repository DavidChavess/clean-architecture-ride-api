import Registry from "../../Registry"
import { HttpServer } from "./HttpServer"

export default class MainController {
  constructor(readonly httpServer: HttpServer) {
    const registry = Registry.getInstance()
    httpServer.register("post", '/update_positions', async (params, body, query) => registry.inject('updatePosition').execute(body))
    httpServer.register("get", '/positions', async (params, body, query) => registry.inject('getPositions').execute(query.rideId))
    httpServer.listen(3003)
  }
}

