import Registry from "../../Registry"
import { HttpServer } from "./HttpServer"

export default class MainController {
  constructor(readonly httpServer: HttpServer) {
    const registry = Registry.getInstance()
    httpServer.register("post", '/request_ride', async (params, body) => registry.inject('requestRide').execute(body))
    httpServer.register("get", '/rides/:rideId', async (params, body) => registry.inject('getRide').execute(params.rideId))
    httpServer.listen(3000)
  }
}

