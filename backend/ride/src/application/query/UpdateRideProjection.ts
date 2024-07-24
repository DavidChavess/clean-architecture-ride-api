import { MongoClient } from "mongodb";
import { DataBaseConnection } from "../../infra/database/DataBaseConnection";

export default class UpdateRideProjection {

  constructor(private readonly connection: DataBaseConnection) { }

  async execute(input: any): Promise<void> {
    console.log('UpdateRideProjection', input)
    const connection = await this.connection.getConnection() as MongoClient
    const collection = connection.db().collection("rideProjection")
    await collection.findOneAndUpdate({ rideId: input.rideId }, { $set: { ...input } }, { upsert: true })
  }
}
