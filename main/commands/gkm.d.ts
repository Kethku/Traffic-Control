declare module "gkm" {
  declare var gkmStatic: {
    events: {
      on(name: string, callback: (data: any) => void): void;
    }
  };
  export default gkmStatic;
}
