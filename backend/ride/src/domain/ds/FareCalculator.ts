abstract class FareCalculator {
  abstract FARE: number
  
  calculate(distance: number): number {
    return distance * this.FARE
  }
}

class NormalFareCalculator extends FareCalculator {
  FARE: number = 2.1
}

class NocturnalFareCalculator extends FareCalculator {
  FARE: number = 3.9
}

export default abstract class FareCalculatorFactory {
  static create(date: Date): FareCalculator {
    if (date.getHours() >= 23 || date.getHours() <= 6 ) {
      return new NocturnalFareCalculator()
    }
    return new NormalFareCalculator()
  }
}