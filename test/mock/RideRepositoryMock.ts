import Ride from "../../src/domain/Ride";
import RideRepository from "../../src/infra/repository/RideRepository";

export class RideRepositorySpy implements RideRepository {

  getRideInput: string = ''
  getRideOutput: any = Ride.create('any_passenger_id', -56.5865, -45.8989, -30.8785, -48.6256)
  getRidesByDriverIdAndStatusInInput: any = {}
  updateInput: Ride | null = null

  async getRide(rideId: string): Promise<Ride | null> {
    this.getRideInput = rideId
    return Promise.resolve(this.getRideOutput)
  }

  async getRidesByDriverIdAndStatusIn(driverId: string, status: string[]): Promise<Ride[] | null> {
    this.getRidesByDriverIdAndStatusInInput.driverId = driverId
    this.getRidesByDriverIdAndStatusInInput.status = status
    return Promise.resolve(null)
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