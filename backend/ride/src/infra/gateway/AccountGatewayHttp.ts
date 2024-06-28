import axios from 'axios'

axios.defaults.validateStatus = function () {
	return true;
}

export interface AccountGateway {
  getById(id: string): Promise<any | null>
  signup(account: any): Promise<any>
}

export class AccountGatewayHttp implements AccountGateway {
  async getById(id: string): Promise<any | null> {
    const response = await axios.get(`http://localhost:3001/signup/${id}`)
    if (response.status < 200 || response.status > 299) return null
    return response.data
  }

  async signup(account: any): Promise<any> {
    const response = await axios.post(`http://localhost:3001/signup`, account)
    return response.data
  }
}