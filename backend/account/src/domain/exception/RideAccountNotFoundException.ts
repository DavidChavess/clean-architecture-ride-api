export class RideAccountNotFoundException extends Error {
  constructor(){
    super("To create a ride, it's necessary that the account exists.");
  }
}
