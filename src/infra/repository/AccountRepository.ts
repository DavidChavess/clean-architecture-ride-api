import Account from "../../domain/entity/Account";
import { DataBaseConnection } from "../database/DataBaseConnection";

export default interface AccountRepository {
  save(account: Account): Promise<void>
  getById(id: string): Promise<Account | null>
  getByEmail(email: string): Promise<Account | null>
}

export class AccountRepositoryDatabase implements AccountRepository {
  
  constructor(readonly database: DataBaseConnection){}
  
  async save(account: Account): Promise<void> {
    await this.database.query(
      "insert into cccat15.account (account_id, name, email, cpf, car_plate, is_passenger, is_driver) values ($1, $2, $3, $4, $5, $6, $7)", 
      [account.accountId, account.getName(), account.getEmail(), account.getCpf(), account.getCarPlate(), !!account.isPassenger, !!account.isDriver]
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
