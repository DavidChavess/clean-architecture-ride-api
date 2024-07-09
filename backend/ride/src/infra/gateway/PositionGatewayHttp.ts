import axios from 'axios'

axios.defaults.validateStatus = function () {
  return true;
}

export interface PositionGateway {
  getByRideId(rideId: string): Promise<any[] | null>
}

export class PositionGatewayHttp implements PositionGateway {
  async getByRideId(rideId: string): Promise<any[] | null> {
    const response = await axios.get(`http://localhost:3003/positions`, { params: { rideId } })
    if (response.status < 200 || response.status > 299) return null
    return response.data
  }
}