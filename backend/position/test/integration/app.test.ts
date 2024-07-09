import axios from "axios"
import crypto from 'crypto'

axios.defaults.validateStatus = function () {
	return true;
}

test("Deve recuperar as posiçoes da corrida", async () => {
  const updateInput = {
    rideId: crypto.randomUUID(),
    lat: -27.496887588317275,
		long: -48.522234807851476
  }
  await axios.post('http://localhost:3003/update_positions', updateInput )
  const { data } = await axios.get('http://localhost:3003/positions', { params: { rideId: updateInput.rideId } } )
  const currentPosition = data[0]
  expect(currentPosition.positionId).toBeDefined()
  expect(currentPosition.rideId).toBe(updateInput.rideId)
  expect(currentPosition.lat).toBe(updateInput.lat)
  expect(currentPosition.long).toBe(updateInput.long)
})
