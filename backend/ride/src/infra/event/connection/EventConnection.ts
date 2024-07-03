export interface EventConnection {
  connect(): Promise<void>
  close(): Promise<void>
}