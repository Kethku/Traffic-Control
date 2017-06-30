declare namespace Viz {
  interface VizImageOptions {
    href: string,
    width: number,
    height: number
  }

  interface VizFileOptions {
    path: string,
    data: string
  }

  interface VizOptions {
    engine?: "circo" | "dot" | "neato" | "osage" | "twopi",
    scale?: number,
    images?: VizImageOptions[],
    files?: VizFileOptions[],
    totalMemory?: number
  }

  interface VizOptionsPNG extends VizOptions {
    format: "png-image-element"
  }

  interface VizOptionsOther extends VizOptions {
    format?: "svg" | "xdot" | "plain" | "ps" | "json"
  }

  interface VizStatic {
    (src: string, options?: VizOptionsPNG): HTMLImageElement;
    (src: string, options?: VizOptionsOther): string;

    svgXmlToPngImageElement(svgXml: string, scale?: number, callback?: (err: any, image: HTMLImageElement) => void);
    svgXmlToPngBase64(svgXml: string, scale: number, callback: (err: any, data: string) => void);
  }
}

declare var Viz: Viz.VizStatic;
