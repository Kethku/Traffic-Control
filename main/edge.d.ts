declare module Edge {
  interface StaticEdge {
    func(code: string): (arg: any, callback: (error: any, result: any) => void) => void;
  }
}

declare module 'electron-edge' {
  declare var edgeInstance: Edge.StaticEdge;
  export default edgeInstance;
}
