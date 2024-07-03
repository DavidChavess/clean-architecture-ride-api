import axios from 'axios'

axios.defaults.validateStatus = function () {
	return true;
}

export interface PaymentGateway {
  getByRideId(rideId: string): Promise<any | null>
}

export class PaymentGatewayHttp implements PaymentGateway {
  async getByRideId(rideId: string): Promise<any | null> {
    const response = await axios.get('http://localhost:3002/get_payment', { params: { rideId } } )
    if (response.status < 200 || response.status > 299) return null
    return response.data
  }
}