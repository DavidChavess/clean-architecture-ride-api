import { EventConnection } from "./EventConnection";
import amqp from 'amqplib/callback_api';


export default class RabbitMqEventAdapter implements EventConnection {

  private connection!: amqp.Connection
  private channel!: amqp.Channel

  async connect(): Promise<void> {
    this.connection = await new Promise<amqp.Connection>((resolve, reject) => {
      amqp.connect('amqp://app:123456@localhost', (connectionError, connection) => {
        if (connectionError) reject(connectionError)
        resolve(connection)
      })
    })

    this.channel = await new Promise<amqp.Channel>((resolve, reject) => {
      this.connection.createChannel((error, channel) => {
        if (error) reject(error)
        resolve(channel)
      })
    })
  }

  async send(queue: string, message: any): Promise<void> {
    if (!this.channel) {
      throw new Error('Channel not found')
    }
    await new Promise<void>((resolve, reject) => {
      this.channel.assertQueue(queue, { durable: false })
      this.channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)))
      resolve()
    })
  }

  async listener(queue: string, callback: (message: any) => void): Promise<void> {
    if (!this.channel) {
      throw new Error('Channel not found')
    }
    await new Promise<void>((resolve, reject) => {
      this.channel.consume(queue, (message => {
        if (message) {
          const json = JSON.parse(message.content.toString())
          callback(json)
        }
        resolve()
      }), { noAck: true })
    })
  }

  async close(): Promise<void> {
    if (!this.connection) {
      throw new Error('Connection not found')
    }
    await Promise.resolve(this.connection.close())
  }
}