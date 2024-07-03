export interface EventEmitter {
  send(queue: string, message: any): Promise<void>
}