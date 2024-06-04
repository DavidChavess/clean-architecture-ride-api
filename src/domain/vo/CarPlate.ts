import { InvalidFieldException } from "../../exception"

export class CarPlate {

  constructor(private readonly carPlate: string) {
    if (!carPlate.match(/[A-Z]{3}[0-9]{4}/)) {
      throw new InvalidFieldException('carPlate')
    }
  }

  getValue() : string {
    return this.carPlate
  }
}