import { DomainEvent } from "../../domain/event/DomainEvent";
import { EventEmitter } from "../../infra/event/EventEmitter";
import { AccountGateway } from "../../infra/gateway/AccountGatewayHttp";
import RideRepository from "../../infra/repository/RideRepository";

type Input = {
  rideId: string,
  driverId: string
}

export default class AcceptRide {
  constructor(
    readonly accountGateway: AccountGateway,
    readonly rideRepository: RideRepository,
    readonly eventEmitter: EventEmitter 
  ){}  

  async execute(input: Input): Promise<void> {
    const driver = await this.accountGateway.getById(input.driverId)
    if (!driver) throw new Error('Driver not found')
    if (!driver.isDriver) throw new Error('The account is not a driver')
    const ride = await this.rideRepository.getRide(input.rideId)
    if (!ride) throw new Error('Ride not found')
    const ridesByDriverIdAndStatusIn = await this.rideRepository.getRidesByDriverIdAndStatusIn(input.driverId, ['accepted', 'in_progress'])
    if (ridesByDriverIdAndStatusIn) throw new Error('It was not possible to accept the ride because there are pending rides from the driver')
    ride.register('ride_accepted', async (event: DomainEvent) => {
      await this.eventEmitter.notify(event.eventName, Object.assign({}, event, { driver }))
    })
    ride.accept(input.driverId)
    await this.rideRepository.update(ride)
  }
}