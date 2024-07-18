import { EventEmitter } from "../event/EventEmitter"

export default class Mediator implements EventEmitter {
  services: { event: string, callback: Function }[]

  constructor() {
    this.services = []
  }

  register(event: string, callback: Function) {
    this.services.push({ event, callback })
  }

  async notify(event: string, data: any): Promise<void> {
    for (const service of this.services) {
      if (service.event === event) {
        await service.callback(data)
      }
    }
  }
}