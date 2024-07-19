export interface EventEmitter {
  notify(event: string, data: any): Promise<void>
}