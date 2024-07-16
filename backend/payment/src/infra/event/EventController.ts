import Registry from "../../Registry";
import { EventConnection } from "./connection/EventConnection";

export default class EventController {
  constructor(private readonly eventConnection: EventConnection) {}

  async execute(): Promise<void> {
    const registry = Registry.getInstance()
    await this.eventConnection.connect()
    await this.eventConnection.listener(
      'ride_finished', 
      async message => registry.inject('processPayment').execute(message)
    )   
  }
}  