import { EventConnection } from "./connection/EventConnection";
import amqp from 'amqplib/callback_api';
import { EventEmitter } from "./EventEmitter";
import { EventListener } from "./EventListener";

export default class RabbitMqEventAdapter implements EventConnection, EventEmitter, EventListener {

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

  async notify(event: string, data: any): Promise<void> {
    if (!this.channel) {
      throw new Error('Channel not found')
    }
    await new Promise<void>((resolve, reject) => {
      this.channel.assertQueue(event, { durable: false })
      this.channel.sendToQueue(event, Buffer.from(JSON.stringify(data)))
      resolve()
    })
  }
  
  async listen(eventName: string, callback: Function): Promise<void> {
    if (!this.channel) {
      throw new Error('Channel not found')
    }
    await this.channel.consume(eventName, async message => {
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