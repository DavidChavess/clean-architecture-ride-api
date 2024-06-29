import express, { Express, Request, Response } from 'express'
import { HttpServer } from './HttpServer'
import { NotFoundException } from '../../domain/exception/NotFoundException'

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
        if (error instanceof NotFoundException) {
          return res.status(404).json({ message: error.message })    
        }
        return res.status(422).json({ message: error.message })
      }
    })
  }

  async listen(port: number): Promise<void> {
    this.app.listen(port)
  }
}