import express, { json } from "express"
import Signup from "./Signup"
import { AccountDAODatabase } from "./AccountDAO"
import GetAccount from "./GetAccount"
import RequestRide from "./RequestRide"
import { RideDAODatabase } from "./RideDAO"
import GetRide from "./GetRide"

const app = express()
const port = 3000
app.use(express.json())

app.post('/signup', async (req, res) => {
  try {
    const signup = new Signup(new AccountDAODatabase())
    const response = await signup.execute(req.body)
    return res.status(201).json(response)
  } catch (error: any) {
    return res.status(422).json({ message: error.message })
  }
})

app.get('/signup/:accountId', async (req, res) => {
  const getAccount = new GetAccount(new AccountDAODatabase())
  const response = await getAccount.execute(req.params.accountId)
  return res.json(response)
})

app.post('/request_ride', async (req, res) => {
  try {
    const requestRide = new RequestRide(new RideDAODatabase(), new AccountDAODatabase())
    const requestRideOutput = await requestRide.execute(req.body)
    return res.json(requestRideOutput)
  } catch (error: any) {
    return res.status(422).json({ message: error.message })
  }
})

app.get('/rides/:rideId', async (req, res) => {
  const getRide = new GetRide(new RideDAODatabase())
  const getRideOutput = await getRide.execute(req.params.rideId)
  return res.json(getRideOutput)
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})