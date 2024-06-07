import { Coord } from "../vo/Coord";

export default class DistanceCalculator {
  static calculate(from: Coord, to: Coord): number {
    const earthRadius = 6371 
    const degreesToRadians = (degrees: number) => {
      return degrees * Math.PI / 180
    }
    const deltaLat = degreesToRadians(to.getLatValue() - from.getLatValue())
    const deltaLon = degreesToRadians(to.getLongValue() - from.getLongValue())
    const a = 
      Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
      Math.cos(degreesToRadians(from.getLatValue())) * 
      Math.cos(degreesToRadians(to.getLatValue())) *
      Math.sin(deltaLon / 2) *
      Math.sin(deltaLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return Math.round(earthRadius * c)
  }
}