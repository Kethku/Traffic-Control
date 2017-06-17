declare module JSONFormatter {
  export interface Configuration {
    hoverPreviewEnabled?: boolean,
    hoverPreviewArrayCount?: number,
    hoverPreviewFieldCount?: number,
    theme?: string,
    animateOpen?: boolean,
    animateClose?: boolean
  }

  export class Formatter {
    constructor(json: any, open?: number, config?: Configuration);
    render(): HTMLElement;
    openAtDepth(depth: number);
  }
}

declare module "json-formatter-js" {
  export default JSONFormatter.Formatter;
}
