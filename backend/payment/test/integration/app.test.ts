import axios from "axios"
import crypto from 'crypto'

axios.defaults.validateStatus = function () {
	return true;
}

test("Deve testar um pagamento", async () => {
  const rideId = crypto.randomUUID()
  const input = {
    rideId,
    creditCardToken: 'any_credit_token',
    amount: 9.99
  }
  await axios.post('http://localhost:3002/process_payment', input)
  const responseGetPayment = await axios.get(`http://localhost:3002/get_payment`, { params: { rideId } })
  const outputGetPayment = responseGetPayment.data
  expect(outputGetPayment.paymentId).toBeDefined()
  expect(outputGetPayment.rideId).toBe(input.rideId)
  expect(outputGetPayment.amount).toBe(input.amount)
  expect(outputGetPayment.status).toBe('success')
})
