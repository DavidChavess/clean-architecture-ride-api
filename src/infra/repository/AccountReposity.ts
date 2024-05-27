import Account from "../../domain/Account";
import { DataBaseConnection } from "../database/DataBaseConnection";

export default interface AccountReposity {
  save(account: any): Promise<void>
  getById(id: any): Promise<Account | null>
  getByEmail(email: any): Promise<Account | null>
}

export class AccountRepositoryDatabase implements AccountReposity {
  
  constructor(readonly database: DataBaseConnection){}
  
  async save(account: any): Promise<void> {
    await this.database.query(
      "insert into cccat15.account (account_id, name, email, cpf, car_plate, is_passenger, is_driver) values ($1, $2, $3, $4, $5, $6, $7)", 
      [account.accountId, account.name, account.email, account.cpf, account.carPlate, !!account.isPassenger, !!account.isDriver]
    );
  }

  async getById(id: string): Promise<Account | null> {
    const [account] = await this.database.query("select * from cccat15.account where account_id = $1", [id]);
    if (!account) return null
    return Account.restore(account.account_id, account.name, account.email, account.cpf, account.is_passenger, account.is_driver, account.car_plate) 
  }

  async getByEmail(email: string): Promise<Account | null> {
    const [account] = await this.database.query("select * from cccat15.account where email = $1", [email])
    if (!account) return null
    return Account.restore(account.account_id, account.name, account.email, account.cpf, account.is_passenger, account.is_driver, account.car_plate) 
  }
}
