export default class Registry {
  
  private dependencies: { [name: string]: any}
  private static instance: Registry

  private constructor() {
    this.dependencies = {}
  }

  registry(name: string, dependency: any) {
    this.dependencies[name] = dependency
  }

  inject(name: string): any {
    return this.dependencies[name]
  }
  
  static getInstance(): Registry {
    if (!Registry.instance){
      this.instance = new Registry()
    }
    return Registry.instance
  }
}