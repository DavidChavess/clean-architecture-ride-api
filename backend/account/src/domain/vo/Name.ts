import { InvalidFieldException } from "../exception"

export class Name {

  constructor(private readonly name: string) {
    if (!name.match(/[a-zA-Z] [a-zA-Z]+/)) {
      throw new InvalidFieldException('name')
    }
  }

  getValue() : string {
    return this.name
  }
}