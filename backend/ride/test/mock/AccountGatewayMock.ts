import { AccountGateway } from "../../src/infra/gateway/AccountGatewayHttp"

export class AccountGatewayMock implements AccountGateway {
  getByIdInput: string = ''
  getByIdOutput = {
    name: 'Fulano Tal', 
    email: `input${Math.random()}@gmail.com`, 
    cpf: '97456321558', 
    isDriver: true, 
    isPassenger: true, 
    carPlate: "SGH5986"
  }

  async getById(id: string): Promise<any | null> {
    this.getByIdInput = id
    return this.getByIdOutput
  }

  signup(account: any): Promise<any> {
    throw new Error("Method not implemented.")
  }
}