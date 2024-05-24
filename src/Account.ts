import { InvalidFieldException, InvalidCpfException } from "./exception";
import { validateCpf } from "./validateCpf";
import crypto from "crypto"

export default class Account {
  private constructor(
    readonly accountId: string,
    readonly name: string,
    readonly email: string,
    readonly cpf: string,
    readonly isPassenger: boolean,
    readonly isDriver: boolean,
    readonly carPlate?: string
  ) {
    if (!this.isValidName(name)) throw new InvalidFieldException('name')
    if (!this.isValidEmail(email)) throw new InvalidFieldException('email')
    if (!validateCpf(cpf)) throw new InvalidCpfException()
    if (isDriver && carPlate && !this.isValidCarPlate(carPlate)) throw new InvalidFieldException('carPlate')
  }

  static create(name: string, email: string, cpf: string, isPassenger: boolean, isDriver: boolean, carPlate?: string): Account {
    const accountId = crypto.randomUUID()
    return new this(accountId, name, email, cpf, isPassenger, isDriver, carPlate)
  }

  static restore(accountId: string, name: string, email: string, cpf: string, isPassenger: boolean, isDriver: boolean, carPlate?: string): Account {
    return new this(accountId, name, email, cpf, isPassenger, isDriver, carPlate)
  }

  private isValidName(name: string) {
    return name.match(/[a-zA-Z] [a-zA-Z]+/)
  }

  private isValidEmail(email: string) {
    return email.match(/^(.+)@(.+)$/)
  }

  private isValidCarPlate(carPlate: string) {
    return carPlate.match(/[A-Z]{3}[0-9]{4}/)
  }
}