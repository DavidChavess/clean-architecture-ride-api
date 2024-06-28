import { Position } from "../../domain/entity/Position";
import { DataBaseConnection } from "../database/DataBaseConnection";

export interface PositionRepository {
  save(position: Position): Promise<void>
  getPositionsByRideId(positionId: string): Promise<Position[] | null>
}

export class PositionRepositoryDatabase implements PositionRepository {
  
  constructor(readonly database: DataBaseConnection){}
 
  async save(position: Position): Promise<void> {
    await this.database.query(
      "insert into cccat15.position (position_id, ride_id, lat, long, date) values ($1, $2, $3, $4, $5)", 
      [position.positionId, position.rideId, position.getLat(), position.getLong(), position.date]
    );
  }

  async getPositionsByRideId(rideId: string): Promise<Position[] | null> {
    const positions: any[] = await this.database.query("select * from cccat15.position where ride_id = $1 order by date desc",  [rideId]);
    if (!positions || positions.length === 0) return null
    return positions.map(position => Position.restore(position.position_id, position.ride_id, Number(position.lat), Number(position.long), position.date))
  }
}
