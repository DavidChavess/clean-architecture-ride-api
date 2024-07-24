import { EventEmitter } from "../../src/infra/event/EventEmitter";

export default class EventEmitterMock implements EventEmitter {
  async notify(event: string, data: any): Promise<void> {
  }
}