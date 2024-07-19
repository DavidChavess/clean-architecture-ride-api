import { DomainEvent } from "./DomainEvent"

export default class Aggregate {

  private services: { eventName: string, callback: Function }[]

  constructor() {
    this.services = []
  }

  register(eventName: string, callback: Function) {
    this.services.push({ eventName, callback })
  }

  async notify(domainEvent: DomainEvent) {
    this.services.forEach(async service => {
      if (service.eventName === domainEvent.eventName) {
        await service.callback(domainEvent)
      }
    })
  }
}