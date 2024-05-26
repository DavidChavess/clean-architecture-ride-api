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
  const responseSignup = await axios.post('http://localhost:3000/signup', input)
  const outputSignup = responseSignup.data
  expect(outputSignup.accountId).toBeDefined()
  const responseGetSignup = await axios.get(`http://localhost:3000/signup/${outputSignup.accountId}`)
  const outputGetSignup = responseGetSignup.data
  expect(outputGetSignup.accountId).toBe(outputSignup.accountId)
  expect(outputGetSignup.name).toBe(input.name)
  expect(outputGetSignup.email).toBe(input.email)
  expect(outputGetSignup.cpf).toBe(input.cpf)
})

test("Deve testar uma solicitação de corrida feita por um passageiro", async () => {
  const signupInput = {
    name: 'Fulano Tal',
    email: `input${Math.random()}@gmail.com`,
    cpf: '97456321558',
    password: 'any password',
    isPassenger: true,
    isDriver: false
  }
  const responseSignup = await axios.post('http://localhost:3000/signup', signupInput)
  const outputSignup = responseSignup.data
  expect(outputSignup.accountId).toBeDefined()
  const rideInput = {
    passengerId: outputSignup.accountId,
    fromLat: -21.3750678,
    fromLong: -48.2409842,
    toLat: -21.3628963,
    toLong: -48.2461194
  }
  const rideOutputResponse = await axios.post('http://localhost:3000/request_ride', rideInput)
  const rideOutput = rideOutputResponse.data
  expect(rideOutput.rideId).toBeDefined()
  const getRideResponse = await axios.get(`http://localhost:3000/rides/${rideOutput.rideId}`)
  const getRideOutput = getRideResponse.data
  expect(getRideOutput.rideId).toBe(rideOutput.rideId)
  expect(getRideOutput.fromLat).toBe(rideInput.fromLat)
  expect(getRideOutput.fromLong).toBe(rideInput.fromLong)
  expect(getRideOutput.toLat).toBe(rideInput.toLat)
  expect(getRideOutput.toLong).toBe(rideInput.toLong)
})

test("Não deve solicitar uma corrida por um usuário que não seja passageiro", async () => {
  const signupInput = {
    name: 'Fulano Tal',
    email: `input${Math.random()}@gmail.com`,
    cpf: '97456321558',
    password: 'any password',
    isPassenger: false,
    isDriver: false
  }
  const responseSignup = await axios.post('http://localhost:3000/signup', signupInput)
  const outputSignup = responseSignup.data
  const rideInput = {
    passengerId: outputSignup.accountId,
    fromLat: -21.3750678,
    fromLong: -48.2409842,
    toLat: -21.3628963,
    toLong: -48.2461194
  }
  const rideOutputResponse = await axios.post('http://localhost:3000/request_ride', rideInput)
  const rideOutput = rideOutputResponse.data
  expect(rideOutputResponse.status).toBe(422)
  expect(rideOutput.message).toBe("A conta não é de um passageiro")
})