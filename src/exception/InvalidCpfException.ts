import { InvalidFieldException } from "./InvalidFieldException";

export class InvalidCpfException extends InvalidFieldException {
  constructor(){
    super('CPF');
  }
}