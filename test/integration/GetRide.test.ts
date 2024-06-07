import GetAccount from "../../src/application/usecase/GetAccount"
import Signup from "../../src/application/usecase/Signup"
import { DataBaseConnection } from "../../src/infra/database/DataBaseConnection"
import PostgresDataBase from "../../src/infra/database/PostgresDataBase"
import AccountReposity, { AccountRepositoryDatabase } from "../../src/infra/repository/AccountRepository"
import { mockPassenger } from "../mock/mockAccount"
import crypto from 'crypto'

let database: DataBaseConnection
let getAccount: GetAccount
let signup: Signup
let accountRepository: AccountReposity

beforeEach(() => {
  database = new PostgresDataBase()
  accountRepository = new AccountRepositoryDatabase(database)
  signup = new Signup(accountRepository)
  getAccount = new GetAccount(accountRepository)
})

afterEach(async () => {
  await database.close()
})

test('Deve recuperar uma conta criada para passageiro', async () => {
  const passenger = mockPassenger()
  const account = await signup.execute(passenger)
  expect(account.accountId).toBeTruthy()
  const createdAccount = await getAccount.execute(account.accountId)
  expect(createdAccount.accountId).toBe(account.accountId)
  expect(createdAccount.name).toBe(passenger.name)
  expect(createdAccount.email).toBe(passenger.email)
  expect(createdAccount.cpf).toBe(passenger.cpf)
})

test('Deve lançar erro se a conta não existir', async () => {
  await expect(getAccount.execute(crypto.randomUUID())).rejects.toThrow(new Error('Conta não encontrada'))
})