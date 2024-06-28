import crypto from "crypto";
import { Coord } from "../vo/Coord";

export class Position {

  private coord: Coord
  
  private constructor(readonly positionId: string, readonly rideId: string, lat: number, long: number, readonly date: Date) {
    this.coord = new Coord(lat, long)
  }

  static create(rideId: string, lat: number, long: number): Position {
    const date = new Date()
    const positionId = crypto.randomUUID()
    return new Position(positionId, rideId, lat, long, date);
  }

  static restore(positionId: string, rideId: string, lat: number, long: number, date: Date): Position {
    return new Position(positionId, rideId, lat, long, date);
  }

  getLat(): number {
    return this.coord.getLatValue()
  }

  getLong(): number {
    return this.coord.getLongValue()
  }
}