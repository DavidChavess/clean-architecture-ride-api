import Registry from '../../Registry'
import { EventListener } from './EventListener'

export default class EventController {

  constructor (readonly eventListener: EventListener) { }

  async execute() {
    const registry = Registry.getInstance()
    const queues = ['ride_requested', 'ride_accepted', 'ride_started', 'ride_finished']
    queues.forEach(async (queue: string) => {
      await this.eventListener.listen(
        queue, 
        async (message: any) => registry.inject('updateRideProjection').execute(message)
      ) 
    }); 
  }
}