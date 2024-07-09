export interface Event {
  connect(): Promise<void>
  listener(queue: string, callback: (message: any) => void): Promise<void>
  send(queue: string, message: any): Promise<void>
  close(): Promise<void>
}