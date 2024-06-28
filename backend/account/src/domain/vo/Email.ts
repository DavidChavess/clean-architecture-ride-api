import { InvalidFieldException } from "../exception"

export class Email {

  constructor(private readonly email: string) { 
    if (!email.match(/^(.+)@(.+)$/)) {
      throw new InvalidFieldException('email')
    }
  }

  getValue() : string {
    return this.email
  }
}