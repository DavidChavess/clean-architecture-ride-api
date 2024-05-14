export class InvalidFieldException extends Error {
  constructor(private readonly field: String){
    super(`O campo ${field} está inválido`);
  }
}