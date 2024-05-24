import { EmailAlreadyExistException } from "./exception";
import AccountReposity from "./AccountReposity";
import Account from "./Account";

export default class Signup {
	constructor(readonly accountRepository: AccountReposity) {}

	async execute(input: Input): Promise<Output> {
		const account = Account.create(input.name, input.email, input.cpf, input.isPassenger, input.isDriver, input.carPlate)
		if (await this.accountRepository.getByEmail(account.email)) throw new EmailAlreadyExistException()
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