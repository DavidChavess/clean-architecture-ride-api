import Mediator from "../../infra/mediator/Mediator";

export default class ProcessPaymentFake {
  constructor(readonly mediator: Mediator) { }

  async execute(): Promise<void> {
    this.mediator.notify("ProcessPaymentFake", { event: 'ProcessPaymentFake', data: { test: true } })
  }
}