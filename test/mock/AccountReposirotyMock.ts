import Account from "../../src/domain/Account"
import AccountReposity from "../../src/infra/repository/AccountReposity"

export class AccountRepositorySpy implements AccountReposity {
  getByIdInput: string = ''
  getByIdOutput: Account = Account.create('Fulano Tal', `input${Math.random()}@gmail.com`, '97456321558', true, true, "SGH5986")

  async save(account: Account): Promise<void> {
    throw new Error("Method not implemented.")
  }
  
  async getById(id: string): Promise<Account | null> {
    this.getByIdInput = id
    return this.getByIdOutput
  }

  async getByEmail(email: string): Promise<Account | null> {
    throw new Error("Method not implemented.")
  }
}