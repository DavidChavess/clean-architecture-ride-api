import crypto from "crypto";
import { validateCpf } from "./validateCpf";
import { EmailAlreadyExistException, InvalidCpfException, InvalidFieldException } from "./exception";
import AccountDAO from "./AccountDAO";

export type SignupInput = {
  accountId?: string
  name: string
  email: string
  cpf: string
  carPlate?: string | undefined
  isPassenger?: boolean
  isDriver?: boolean
}

export type SignupOutput = {
	accountId: string
}

export default class Signup {
	constructor(readonly accountDao: AccountDAO) {}

	private isValidName(name: string) {
		return name.match(/[a-zA-Z] [a-zA-Z]+/)
	}

  private isValidEmail(email: string) {
		return email.match(/^(.+)@(.+)$/)
	}

	private isValidCarPlate(carPlate?: string) {
		return carPlate?.match(/[A-Z]{3}[0-9]{4}/)
	}

	async execute(account: SignupInput): Promise<SignupOutput> {
		account.accountId = crypto.randomUUID()
		if (await this.accountDao.getByEmail(account.email)) throw new EmailAlreadyExistException()
		if (!this.isValidName(account.name)) throw new InvalidFieldException('name')
		if (!this.isValidEmail(account.email)) throw new InvalidFieldException('email')
		if (!validateCpf(account.cpf)) throw new InvalidCpfException()
		if (account.isDriver && !this.isValidCarPlate(account.carPlate)) throw new InvalidFieldException('carPlate')
		await this.accountDao.save(account)
		return { accountId: account.accountId }
	}
}