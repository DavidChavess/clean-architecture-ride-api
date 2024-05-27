import express, { Express, Request, Response } from 'express'

export interface HttpServer {
  register(
    method: "get" | "post" | "put" | "delete" | "patch",
    route: string,
    callback: (params: any, body: any) => any
  ): Promise<any>

  listen(port: number): Promise<void>
}

export default class ExpressAdapter implements HttpServer {

  private readonly app: Express

  constructor() {
    this.app = express()
    this.app.use(express.json())
  }

  async register(method: "get" | "post" | "put" | "delete" | "patch", route: string, callback: Function): Promise<any> {
    return this.app[method](route, async (req: Request, res: Response) => {
      try {
        const response = await callback(req.params, req.body)
        if (method === 'post') {
          return res.status(201).json(response)
        }
        return res.json(response)
      } catch (error: any) {
        return res.status(422).json({ message: error.message })
      }
    })
  }

  async listen(port: number): Promise<void> {
    this.app.listen(port)
  }
}