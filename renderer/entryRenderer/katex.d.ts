declare module Katex {
  declare interface RenderingOptions {
    displayMode?: boolean;
    throwOnError?: boolean;
    errorColor?: string;
    macros?: {[macro: string]: string};
    colorIsTextColor?: boolean;
  }

  declare interface DelimiterOptions {
    left: string;
    right: string;
    display: string;
  }

  declare interface AutoRenderOptions {
    delimiters?: DelimiterOptions[];
    ignoredTags?: string[];
  }

  declare interface KatexStatic {
    render(latex: string, element: HTMLElement, options?: RenderingOptions);
    renderToString(latex: string, options?: RenderingOptions): string;
    renderMathInElement(element: HTMLElement, options?: AutoRenderOptions);
  }
}

declare module "katex" {
  declare var katex: Katex.KatexStatic;
  export default katex;
}
