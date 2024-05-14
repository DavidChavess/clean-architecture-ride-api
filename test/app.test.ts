import axios from "axios"

test("Deve testar uma conta criada para passageiro", async () => {
  const input = {
    name: 'Fulano Tal',
    email: `input${Math.random()}@gmail.com`,
    cpf: '97456321558',
    password: 'any password',
    isPassenger: true
  }
  const responseSignup = await axios.post('http://localhost:3000/signup', input)
  const outputSignup = responseSignup.data
  expect(outputSignup.accountId).toBeDefined()
  const responseGetSignup = await axios.get(`http://localhost:3000/signup/${outputSignup.accountId}`)
  const outputGetSignup = responseGetSignup.data
  expect(outputGetSignup.name).toBeDefined()  
})