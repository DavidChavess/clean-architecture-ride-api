import AccountReposity from "../../infra/repository/AccountReposity";

export type GetAccountOutput = {
  accountId?: string
  name: string
  email: string
  cpf: string
  carPlate?: string | undefined
  isPassenger?: boolean
  isDriver?: boolean
}

export default class GetAccount {
	constructor(readonly accountRepository: AccountReposity) {}

	async execute(accountId: string): Promise<GetAccountOutput | null> {
		return this.accountRepository.getById(accountId)
	}
}