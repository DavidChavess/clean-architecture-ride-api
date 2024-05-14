export class EmailAlreadyExistException extends Error {
  constructor(){
    super("Email já existe");
  }
}