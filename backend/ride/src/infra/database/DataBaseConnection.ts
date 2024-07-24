export interface DataBaseConnection {
  query(query: any, param: any): Promise<any>
  close(): Promise<any>
  connect(): Promise<void>
  getConnection(): Promise<any>
}