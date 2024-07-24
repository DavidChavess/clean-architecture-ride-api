import { MongoClient } from "mongodb";
import { DataBaseConnection } from "../../infra/database/DataBaseConnection";

export default class GetRideQuery {
  
  constructor(private readonly connection: DataBaseConnection) {}

  async execute(rideId: string): Promise<any> {
    const connection = await this.connection.getConnection() as MongoClient
    const collection = connection.db().collection("rideProjection")
    return collection.findOne({ rideId })
  }
}