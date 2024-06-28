import axios from "axios"

axios.defaults.validateStatus = function () {
	return true;
}

test("Deve testar uma conta criada para passageiro", async () => {
  const input = {
    name: 'Fulano Tal',
    email: `input${Math.random()}@gmail.com`,
    cpf: '97456321558',
    password: 'any password',
    isPassenger: true,
    isDriver: false
  }
  const responseSignup = await axios.post('http://localhost:3001/signup', input)
  const outputSignup = responseSignup.data
  expect(outputSignup.accountId).toBeDefined()
  const responseGetSignup = await axios.get(`http://localhost:3001/signup/${outputSignup.accountId}`)
  const outputGetSignup = responseGetSignup.data
  expect(outputGetSignup.accountId).toBe(outputSignup.accountId)
  expect(outputGetSignup.name).toBe(input.name)
  expect(outputGetSignup.email).toBe(input.email)
  expect(outputGetSignup.cpf).toBe(input.cpf)
})
