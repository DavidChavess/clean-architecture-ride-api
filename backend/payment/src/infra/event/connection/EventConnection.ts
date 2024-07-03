export interface EventConnection {
  connect(): Promise<void>
  listener(queue: string, callback: (message: any) => void): Promise<void>
  close(): Promise<void>
}