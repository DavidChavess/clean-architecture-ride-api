export class InvalidFieldException extends Error {
  constructor(private readonly field: String){
    super(`The ${field} is invalid`);
  }
}