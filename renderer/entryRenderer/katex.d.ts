declare module katex {
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
  }
}

declare module "katex" {
  export function render(latex: string, element: HTMLElement, options?: RenderingOptions);
  export function renderToString(latex: string, options?: RenderingOptions): string;
  export function renderMathInElement(element: HTMLElement, options?: AutoRenderOptions);
}
