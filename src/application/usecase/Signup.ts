import { EmailAlreadyExistException } from "../../exception";
import AccountRepository from "../../infra/repository/AccountRepository";
import Account from "../../domain/entity/Account";

export default class Signup {
	constructor(readonly accountRepository: AccountRepository) {}

	async execute(input: Input): Promise<Output> {
		const account = Account.create(input.name, input.email, input.cpf, input.isPassenger, input.isDriver, input.carPlate)
		if (await this.accountRepository.getByEmail(account.getEmail())) throw new EmailAlreadyExistException()
		await this.accountRepository.save(account)
		return { accountId: account.accountId }
	}
}

type Input = {
  name: string
  email: string
  cpf: string
  isPassenger: boolean
  isDriver: boolean,
	carPlate?: string
}

type Output = {
	accountId: string
}