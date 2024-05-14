export class InvalidCpfException extends Error {
  constructor(){
    super(`O CPF está inválido`);
  }
}