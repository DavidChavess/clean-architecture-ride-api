import Registry from "../../Registry"
import { Event } from "./Event"

export default class EventController {
  constructor(private readonly event: Event) {}

  async execute(): Promise<void> {
    const registry = Registry.getInstance()
    await this.event.connect()
    await this.event.listener(
      'position_updated', 
      async message => registry.inject('updatePosition').execute(message)
    )   
  }
}  