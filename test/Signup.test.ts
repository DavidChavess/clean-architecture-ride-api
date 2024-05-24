import AccountReposity, { AccountRepositoryDatabase } from "../src/AccountReposity"
import { EmailAlreadyExistException, InvalidCpfException, InvalidFieldException } from "../src/exception"
import GetAccount from "../src/GetAccount"
import Signup from "../src/Signup"

function mockPassenger() {
  return {
    name: 'Fulano Tal',
    email: `input${Math.random()}@gmail.com`,
    cpf: '97456321558',
    isPassenger: true,
    isDriver: false
  }
}

let getAccount: GetAccount 
let signup: Signup
let accountRepository: AccountReposity

beforeEach(() => {
  accountRepository = new AccountRepositoryDatabase()
  signup = new Signup(accountRepository)
  getAccount = new GetAccount(accountRepository)
})

test('Deve testar nome inválido', async () => {
  const input = { ...mockPassenger(), name: '123' }
  await expect(signup.execute(input)).rejects.toThrow(new InvalidFieldException('name'))
})

test('Deve testar email inválido', async () => {
  const input = { ...mockPassenger(), email: '123.com' }
  await expect(signup.execute(input)).rejects.toThrow(new InvalidFieldException('email'))
})


test('Deve testar cpf inválido', async () => {
  const input = { ...mockPassenger(), cpf: '00000000000' }
  await expect(signup.execute(input)).rejects.toThrow(new InvalidCpfException())
})

test('Deve testar uma conta para um motorista onde a placa de carro é inválida', async () => {
  const input = { ...mockPassenger(), isPassenger: false, isDriver: true, carPlate: 'Zh55923' }
  await expect(signup.execute(input)).rejects.toThrow(new InvalidFieldException('carPlate'))
})

test('Deve testar uma conta criada para motorista', async () => {
  const input = { ...mockPassenger(), isPassenger: false, isDriver: true, carPlate: 'SJK4875' }
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
  const passenger = mockPassenger()
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
  const input = mockPassenger()
  await signup.execute(input)
  await expect(signup.execute(input)).rejects.toThrow(new EmailAlreadyExistException())
})