import { CarPlate, Cpf, Email, Name } from "../vo";
import crypto from "crypto"

export default class Account {
  private name: Name
  private email: Email
  private cpf: Cpf
  private carPlate?: CarPlate

  private constructor(
    readonly accountId: string,
    name: string,
    email: string,
    cpf: string,
    readonly isPassenger: boolean,
    readonly isDriver: boolean,
    carPlate?: string
  ) {
    this.name = new Name(name)
    this.email = new Email(email)
    this.cpf = new Cpf(cpf)
    if (isDriver && carPlate) this.carPlate = new CarPlate(carPlate)
  }

  static create(name: string, email: string, cpf: string, isPassenger: boolean, isDriver: boolean, carPlate?: string): Account {
    const accountId = crypto.randomUUID()
    return new this(accountId, name, email, cpf, isPassenger, isDriver, carPlate)
  }

  static restore(accountId: string, name: string, email: string, cpf: string, isPassenger: boolean, isDriver: boolean, carPlate?: string): Account {
    return new this(accountId, name, email, cpf, isPassenger, isDriver, carPlate)
  }

  getName(): string {
    return this.name.getValue()
  }

  getCpf(): string {
    return this.cpf.getValue()
  }

  getEmail(): string {
    return this.email.getValue()
  }

  getCarPlate(): string | undefined {
    if (this.carPlate) return this.carPlate.getValue()
  }
}