import express from "express"
import Signup from "./Signup"
import { AccountDAODatabase } from "./AccountDAO"
import GetAccount from "./GetAccount"

const app = express()
const port = 3000
app.use(express.json())

app.post('/signup', async (req, res) => {
  try {
    const signup = new Signup(new AccountDAODatabase())
    const response = await signup.execute(req.body)
    res.status(201).send(response)
  } catch (error: any) {
    res.status(400).send({error: error.message})
  }
})

app.get('/signup/:accountId', async (req, res) => {
  const getAccount = new GetAccount(new AccountDAODatabase())
  const response = await getAccount.execute(req.params.accountId)
  res.json(response)
})


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})