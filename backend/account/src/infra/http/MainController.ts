import Registry from "../../Registry"
import { HttpServer } from "./HttpServer"

export default class MainController {
  constructor(readonly httpServer: HttpServer) {
    const registry = Registry.getInstance()
    httpServer.register("post", '/signup', async (params, body) => registry.inject('signup').execute(body))
    httpServer.register("get", '/signup/:accountId', async (params, body) => registry.inject('getAccount').execute(params.accountId))
    httpServer.listen(3001)
  }
}

