import Ride from "../../domain/entity/Ride";
import RideRepository from "../../infra/repository/RideRepository";
import { AccountGateway } from "../../infra/gateway/AccountGatewayHttp";
import { EventEmitter } from "../../infra/event/EventEmitter";
import { DomainEvent } from "../../domain/event/DomainEvent";

type Input = {
  passengerId: string,
  fromLat: number,
  fromLong: number,
  toLat: number,
  toLong: number
}

type Output = {
  rideId: string
}

export default class RequestRide {
  constructor(
    readonly rideRepository: RideRepository,
    readonly accountGateway: AccountGateway,
    readonly eventEmitter: EventEmitter   
  ) { }

  async execute(input: Input): Promise<Output> {
    const passenger = await this.accountGateway.getById(input.passengerId)
    if (!passenger) throw new Error("To create a ride, it's necessary that the account exists.")
    if (!passenger.isPassenger) throw new Error("The account is not a passenger")
    const pendingRides = await this.rideRepository.getPendingRidesByPassengerId(passenger.accountId)
    if (pendingRides) throw new Error("It was not possible to request the ride because there are pending rides from the passenger")
    const ride = Ride.create(input.passengerId, input.fromLat, input.fromLong, input.toLat, input.toLong)
    ride.register('ride_requested', async (event: DomainEvent) => {
      await this.eventEmitter.notify(event.eventName, Object.assign({}, event, { passenger }))
    })
    ride.request()
    await this.rideRepository.save(ride)
    return { rideId: ride.rideId }
  }
}