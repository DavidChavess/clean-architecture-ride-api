export interface DataBaseConnection {
  query(query: any, param: any): Promise<any>
  close(): Promise<any>
}