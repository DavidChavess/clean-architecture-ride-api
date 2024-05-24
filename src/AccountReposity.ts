import pgp from "pg-promise";
import Account from "./Account";

export default interface AccountReposity {
  save(account: any): Promise<void>
  getById(id: any): Promise<Account | null>
  getByEmail(email: any): Promise<Account | null>
}

export class AccountRepositoryDatabase implements AccountReposity {
  async save(account: any): Promise<void> {
    const connection = await pgp()("postgres://postgres:123456@localhost:5432/app");
    await connection.query("insert into cccat15.account (account_id, name, email, cpf, car_plate, is_passenger, is_driver) values ($1, $2, $3, $4, $5, $6, $7)", [account.accountId, account.name, account.email, account.cpf, account.carPlate, !!account.isPassenger, !!account.isDriver]);
    await connection.$pool.end();
  }

  async getById(id: string): Promise<Account | null> {
    const connection = await pgp()("postgres://postgres:123456@localhost:5432/app");
    const [account] = await connection.query("select * from cccat15.account where account_id = $1", [id]);
    await connection.$pool.end();
    if (!account) return null
    return Account.restore(account.account_id, account.name, account.email, account.cpf, account.is_passenger, account.is_driver, account.car_plate) 
  }

  async getByEmail(email: string): Promise<Account | null> {
    const connection = await pgp()("postgres://postgres:123456@localhost:5432/app");
    const [account] = await connection.query("select * from cccat15.account where email = $1", [email])
    await connection.$pool.end();
    if (!account) return null
    return Account.restore(account.account_id, account.name, account.email, account.cpf, account.is_passenger, account.is_driver, account.car_plate) 
  }
}
