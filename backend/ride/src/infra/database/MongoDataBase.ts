import { MongoClient } from "mongodb";
import { DataBaseConnection } from "./DataBaseConnection";

export default class MongoDataBase implements DataBaseConnection {
  private connection: any

  async connect(): Promise<void> {
    this.connection = await MongoClient.connect('mongodb://localhost:27017/rides')
  }

  async getConnection(): Promise<any> {
    return this.connection
  }

  async query(query: any, params: any): Promise<any> {}
  
  async close(): Promise<any> {
    await this.connection.close()
  }
}