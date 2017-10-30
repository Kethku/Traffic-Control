declare module 'edge' {
  export function func(code: string): (arg: any, callback: (error: any, result: any) => void) => void;
}
