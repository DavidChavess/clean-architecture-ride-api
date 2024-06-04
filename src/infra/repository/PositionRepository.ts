import { Position } from "../../domain/entity/Position";
import { DataBaseConnection } from "../database/DataBaseConnection";

export interface PositionRepository {
  save(position: Position): Promise<void>
}

export class PositionRepositoryDatabase implements PositionRepository {
  
  constructor(readonly database: DataBaseConnection){}
  
  async save(position: Position): Promise<void> {
    await this.database.query(
      "insert into cccat15.position (position_id, ride_id, lat, long, date) values ($1, $2, $3, $4, $5)", 
      [position.positionId, position.rideId, position.lat, position.long, position.date]
    );
  }
}
