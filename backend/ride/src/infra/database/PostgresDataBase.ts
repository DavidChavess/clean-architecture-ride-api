import pgp from "pg-promise";
import { DataBaseConnection } from "./DataBaseConnection";

export default class PostgresDataBase implements DataBaseConnection {
  connection: any

  async connect(): Promise<void> {
    this.connection = pgp()("postgres://postgres:123456@localhost:5432/app");
  }

  async getConnection(): Promise<any> {
    return this.connection
  }

  async query(query: any, param: any): Promise<any> {
    return this.connection.query(query, param)  
  }
  
  async close(): Promise<any> {
    return this.connection.$pool.end();
  }
}