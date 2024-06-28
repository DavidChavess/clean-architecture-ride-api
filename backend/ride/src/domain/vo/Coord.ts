export class Coord {

  constructor(private readonly lat: number, private readonly long: number) {
    if (lat < -90 || lat > 90) {
      throw new Error('Latitude must be between -90 and 90 degrees.');
    }
    if (long < -180 || long > 180) {
      throw new Error('Longitude must be between -180 and 180 degrees.');
    }
  }

  getLatValue() : number {
    return this.lat
  }
  
  getLongValue() : number {
    return this.long
  }
}