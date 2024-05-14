import AccountDAO, { AccountDAODatabase, AccountDAOMemory } from "../src/AccountDAO"
import { EmailAlreadyExistException, InvalidCpfException, InvalidFieldException } from "../src/exception"
import GetAccount from "../src/GetAccount"
import Signup from "../src/Signup"

function mockInput() {
  return {
    name: 'Fulano Tal',
    email: `input${Math.random()}@gmail.com`,
    cpf: '97456321558',
    carPlate: 'SHJ5923',
    password: 'any password',
    isPassenger: false,
    isDriver: true
  }
}

let getAccount: GetAccount 
let signup: Signup
let accountDao: AccountDAO

beforeEach(() => {
  accountDao = new AccountDAODatabase()
  signup = new Signup(accountDao)
  getAccount = new GetAccount(accountDao)
})

test('Deve testar nome inválido', async () => {
  const input = { ...mockInput(), name: '123' }
  await expect(signup.execute(input)).rejects.toThrow(new InvalidFieldException('name'))
})

test('Deve testar email inválido', async () => {
  const input = { ...mockInput(), email: '123.com' }
  await expect(signup.execute(input)).rejects.toThrow(new InvalidFieldException('email'))
})


test('Deve testar cpf inválido', async () => {
  const input = { ...mockInput(), cpf: '00000000000' }
  await expect(signup.execute(input)).rejects.toThrow(new InvalidCpfException())
})

test('Deve testar placa de carro inválida', async () => {
  const input = { ...mockInput(), isDriver: true, carPlate: 'Zh55923' }
  await expect(signup.execute(input)).rejects.toThrow(new InvalidFieldException('carPlate'))
})

test('Deve testar uma conta criada para motorista', async () => {
  const input = { ...mockInput(), isDriver: true, isPassenger: false }
  const account = await signup.execute(input)
  expect(account.accountId).toBeTruthy()
  const createdAccount = await getAccount.execute(account.accountId)
  expect(createdAccount.account_id).toBe(account.accountId)
  expect(createdAccount.name).toBe(input.name)
  expect(createdAccount.email).toBe(input.email)
  expect(createdAccount.cpf).toBe(input.cpf)
})

test('Deve testar uma conta criada para passageiro', async () => {
  const passenger = { ...mockInput(), isDriver: false, isPassenger: true }
  const account = await signup.execute(passenger)
  expect(account.accountId).toBeTruthy()
  const createdAccount = await getAccount.execute(account.accountId)
  expect(createdAccount.account_id).toBe(account.accountId)
  expect(createdAccount.name).toBe(passenger.name)
  expect(createdAccount.email).toBe(passenger.email)
  expect(createdAccount.cpf).toBe(passenger.cpf)
})

test('Deve testar email já existente', async () => {
  const input = mockInput()
  await signup.execute(input)
  await expect(signup.execute(input)).rejects.toThrow(new EmailAlreadyExistException())
})