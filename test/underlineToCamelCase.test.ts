import { underlineToCamelCase, underlineToCamelCaseWord } from "../src/underlineToCamelCase"

test('Deve converter uma objeto de underline para camelCase', () => {
  const isPassengerWithUnderline = { is_passenger: true }
  const isPassengerWithCamelCase = { isPassenger: true }
  const output = underlineToCamelCase(isPassengerWithUnderline)
  expect(output).toEqual(isPassengerWithCamelCase)
})

test('Deve converter uma palavra de underline para camelCase', () => {
  const isPassengerWithUnderline = "is_passenger"
  const isPassengerWithCamelCase = "isPassenger"
  const output = underlineToCamelCaseWord(isPassengerWithUnderline)
  expect(output).toEqual(isPassengerWithCamelCase)
})

test('Deve retornar null quando receber null', () => {
  const output = underlineToCamelCase(null)
  expect(output).toEqual(null)
})