import AccountDAO from "./AccountDAO";

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
	constructor(readonly accountDao: AccountDAO) {}

	async execute(accountId: string): Promise<GetAccountOutput | null> {
		return this.accountDao.getById(accountId)
	}
}