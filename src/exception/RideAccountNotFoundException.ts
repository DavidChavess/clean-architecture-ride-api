export class RideAccountNotFoundException extends Error {
  constructor(){
    super("Para criar uma corrida é necessário que a conta exista");
  }
}
