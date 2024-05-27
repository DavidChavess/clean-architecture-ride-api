import { HttpServer } from "./HttpServer"
import GetAccount from "../../application/usecase/GetAccount"
import GetRide from "../../application/usecase/GetRide"
import RequestRide from "../../application/usecase/RequestRide"
import Signup from "../../application/usecase/Signup"

export default class MainController {
  constructor(readonly httpServer: HttpServer, readonly signup: Signup, readonly getAccount: GetAccount, readonly getRide: GetRide, requestRide: RequestRide ) {
    httpServer.register("post", '/signup', async (params, body) => signup.execute(body))
    httpServer.register("get", '/signup/:accountId', async (params, body) => getAccount.execute(params.accountId))
    httpServer.register("post", '/request_ride', async (params, body) => requestRide.execute(body))
    httpServer.register("get", '/rides/:rideId', async (params, body) => getRide.execute(params.rideId))
    httpServer.listen(3000)
  }
}

