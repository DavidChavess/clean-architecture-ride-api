import Ride from "../../src/domain/entity/Ride";
import RideRepository from "../../src/infra/repository/RideRepository";

export class StartRideRepositoryMock implements RideRepository {

  getRideInput: string = ''
  getRideOutput: Ride | null = null
  getRidesByDriverIdAndStatusInInput: any = {}
  updateInput: Ride | null = null

  async getRide(rideId: string): Promise<Ride | null> {
    this.getRideInput = rideId
    this.getRideOutput = Ride.restore(rideId, 'any_passenger_id', -56.5865, -45.8989, -30.8785, -48.6256, "requested", new Date(), -56.5865, -45.8989, 0)
    this.getRideOutput.accept('any_driver_id')
    return this.getRideOutput
  }

  async getRidesByDriverIdAndStatusIn(driverId: string, status: string[]): Promise<Ride[] | null> {
    this.getRidesByDriverIdAndStatusInInput.driverId = driverId
    this.getRidesByDriverIdAndStatusInInput.status = status
    return null
  }

  async update(ride: Ride): Promise<void> {
    this.updateInput = ride
  }

  async getPendingRidesByPassengerId(accountId: string): Promise<Ride[] | null> {
    throw new Error("Method not implemented.");
  }

  async save(ride: Ride): Promise<void> {
    throw new Error("Method not implemented.");
  }
}