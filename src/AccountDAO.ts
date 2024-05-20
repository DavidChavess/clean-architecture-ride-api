import pgp from "pg-promise";
import { underlineToCamelCase } from "./underlineToCamelCase";

export type AccountEntity = {
  accountId: string,
  name: string,
  email: string,
  cpf: string,
  carPlate: string,
  isPassenger: boolean,
  isDriver: boolean
}

export default interface AccountDAO {
  save(account: any): Promise<void>
  getById(id: any): Promise<AccountEntity | null>
  getByEmail(email: any): Promise<AccountEntity | null>
}

export class AccountDAODatabase implements AccountDAO {
  async save(account: any): Promise<void> {
    const connection = await pgp()("postgres://postgres:123456@localhost:5432/app");
    await connection.query("insert into cccat15.account (account_id, name, email, cpf, car_plate, is_passenger, is_driver) values ($1, $2, $3, $4, $5, $6, $7)", [account.accountId, account.name, account.email, account.cpf, account.carPlate, !!account.isPassenger, !!account.isDriver]);
    await connection.$pool.end();
  }

  async getById(id: string): Promise<AccountEntity | null> {
    const connection = await pgp()("postgres://postgres:123456@localhost:5432/app");
    const [account] = await connection.query("select * from cccat15.account where account_id = $1", [id]);
    await connection.$pool.end();
    return underlineToCamelCase(account);
  }

  async getByEmail(email: string): Promise<AccountEntity | null> {
    const connection = await pgp()("postgres://postgres:123456@localhost:5432/app");
    const [account] = await connection.query("select * from cccat15.account where email = $1", [email])
    await connection.$pool.end();
    return underlineToCamelCase(account);
  }
}

export class AccountDAOMemory implements AccountDAO {

  accounts: any[] = []

  async save(account: any): Promise<void> {
    this.accounts.push(account)
  }

  async getById(id: any): Promise<AccountEntity> {
    return this.accounts.find(account => account.accountId === id)
  }

  async getByEmail(email: any): Promise<AccountEntity> {
    return this.accounts.find(account => account.email === email)
  }
}