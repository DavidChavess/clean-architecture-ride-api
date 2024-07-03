export interface HttpServer {
  register(
    method: "get" | "post" | "put" | "delete" | "patch",
    route: string,
    callback: (params: any, body: any, query: any) => any
  ): Promise<any>

  listen(port: number): Promise<void>
}
