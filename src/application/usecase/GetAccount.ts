import AccountRepository from "../../infra/repository/AccountRepository";

type Output = {
  accountId: string
  name: string
  email: string
  cpf: string
  isPassenger: boolean
  isDriver: boolean
  carPlate?: string
}

export default class GetAccount {
	constructor(readonly accountRepository: AccountRepository) {}

	async execute(accountId: string): Promise<Output> {
		const account = await this.accountRepository.getById(accountId)
    if (!account) throw new Error('Conta não encontrada')
    return {
      accountId: account.accountId,
      name: account.getName(),
      cpf: account.getCpf(),
      email: account.getEmail(),
      carPlate: account.getCarPlate(),
      isDriver: account.isDriver,
      isPassenger: account.isPassenger
    }
	}
}