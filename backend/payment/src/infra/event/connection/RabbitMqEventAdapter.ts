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
    console.log(`Enviando mensagem para a fila ${queue}`, message)
    await new Promise<void>((resolve, reject) => {
      this.channel.assertQueue(queue, { durable: false })
      this.channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)))
      console.log(`Mensagem enviada para a fila ${queue}`, message)
      resolve()
    })
  }

  async listener(queue: string, callback: (message: any) => void): Promise<void> {
    if (!this.channel) {
      throw new Error('Channel not found')
    }
    await this.channel.consume(queue, async message => {
      if (message) {
        try {
          const json = JSON.parse(message.content.toString())
          await callback(json)
          this.channel.ack(message)
        } catch (msg: any) {
          console.log(msg)
        }
      }
    })
  }

  async close(): Promise<void> {
    if (!this.connection) {
      throw new Error('Connection not found')
    }
    await Promise.resolve(this.connection.close())
  }
}