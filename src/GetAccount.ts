import AccountDAO from "./AccountDAO";

export default class GetAccount {
	constructor(readonly accountDao: AccountDAO) {}

	async execute(accountId: string): Promise<any> {
		return this.accountDao.getById(accountId)
	}
}