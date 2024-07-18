import ProcessPaymentFake from "../../src/application/usecase/ProcessPaymentFake"
import Mediator from "../../src/infra/mediator/Mediator"

test('Deve demonstrar o uso do padrão mediator', async () => {
  const mediator = new Mediator()
  mediator.register('ProcessPaymentFake', async (data: any) => console.log(data) )
  const processPayment = new ProcessPaymentFake(mediator)
  await processPayment.execute()
})