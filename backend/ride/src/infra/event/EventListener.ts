export interface EventListener {
  listen(eventName: string, callback: Function): Promise<void>
}