import pgp from "pg-promise";

export default interface AccountDAO {
  save(account: any): Promise<void>
  getById(id: any): Promise<any>
  getByEmail(email: any): Promise<any>
}

export class AccountDAODatabase implements AccountDAO {
  async save(account: any): Promise<void> {
    const connection = await pgp()("postgres://postgres:123456@localhost:5432/app");
    await connection.query("insert into cccat15.account (account_id, name, email, cpf, car_plate, is_passenger, is_driver) values ($1, $2, $3, $4, $5, $6, $7)", [account.accountId, account.name, account.email, account.cpf, account.carPlate, !!account.isPassenger, !!account.isDriver]);
		await connection.$pool.end();
  }

  async getById(id: string): Promise<any> {
    const connection = await pgp()("postgres://postgres:123456@localhost:5432/app");
    const [account] = await connection.query("select * from cccat15.account where account_id = $1", [id]);
    await connection.$pool.end();
    return account
  }

  async getByEmail(email: string): Promise<any> {
    const connection = await pgp()("postgres://postgres:123456@localhost:5432/app");
    const [existsAccount] = await connection.query("select * from cccat15.account where email = $1", [email])
    await connection.$pool.end();
    return existsAccount
  }
}

export class AccountDAOMemory implements AccountDAO {

  accounts: any[] = []

  async save(account: any): Promise<void> {
    this.accounts.push(account)
  }

  async getById(id: any): Promise<any> {
    const account =  this.accounts.find(account => account.accountId === id)
    account.account_id = account.accountId
    account.is_driver = account.isDriver
    account.is_passenger = account.is_passenger
    return account
  }

  async getByEmail(email: any): Promise<any> {
    return this.accounts.find(account => account.email === email)
  }
}