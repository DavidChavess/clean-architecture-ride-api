import AccountDAO, { AccountDAODatabase, AccountDAOMemory } from "../src/AccountDAO"
import { EmailAlreadyExistException, InvalidCpfException, InvalidFieldException } from "../src/exception"
import GetAccount from "../src/GetAccount"
import Signup, { SignupInput } from "../src/Signup"

function mockSignupInput(): SignupInput {
  return {
    name: 'Fulano Tal',
    email: `input${Math.random()}@gmail.com`,
    cpf: '97456321558'
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
  const input = { ...mockSignupInput(), name: '123' }
  await expect(signup.execute(input)).rejects.toThrow(new InvalidFieldException('name'))
})

test('Deve testar email inválido', async () => {
  const input = { ...mockSignupInput(), email: '123.com' }
  await expect(signup.execute(input)).rejects.toThrow(new InvalidFieldException('email'))
})


test('Deve testar cpf inválido', async () => {
  const input = { ...mockSignupInput(), cpf: '00000000000' }
  await expect(signup.execute(input)).rejects.toThrow(new InvalidCpfException())
})

test('Deve testar placa de carro inválida', async () => {
  const input = { ...mockSignupInput(), isDriver: true, carPlate: 'Zh55923' }
  await expect(signup.execute(input)).rejects.toThrow(new InvalidFieldException('carPlate'))
})

test('Deve testar uma conta criada para motorista', async () => {
  const input: SignupInput = { ...mockSignupInput(), isDriver: true, carPlate: "SJK4875" }
  const account = await signup.execute(input)
  expect(account.accountId).toBeTruthy()
  const getAccountOutput = await getAccount.execute(account.accountId)
  const createdAccount = getAccountOutput!!
  expect(createdAccount.accountId).toBe(account.accountId)
  expect(createdAccount.name).toBe(input.name)
  expect(createdAccount.email).toBe(input.email)
  expect(createdAccount.cpf).toBe(input.cpf)
})

test('Deve testar uma conta criada para passageiro', async () => {
  const passenger: SignupInput = { ...mockSignupInput(), isPassenger: true }
  const account = await signup.execute(passenger)
  expect(account.accountId).toBeTruthy()
  const getAccountOutput = await getAccount.execute(account.accountId)
  const createdAccount = getAccountOutput!!  
  expect(createdAccount.accountId).toBe(account.accountId)
  expect(createdAccount.name).toBe(passenger.name)
  expect(createdAccount.email).toBe(passenger.email)
  expect(createdAccount.cpf).toBe(passenger.cpf)
})

test('Deve testar email já existente', async () => {
  const input = mockSignupInput()
  await signup.execute(input)
  await expect(signup.execute(input)).rejects.toThrow(new EmailAlreadyExistException())
})