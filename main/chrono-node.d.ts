declare namespace Chrono {
    interface Chrono {
        parseDate(input: string, ref?: Date, settings?: ChronoSettings): Date;
        parse(input: string, ref?: Date, settings?: ChronoSettings): ParsedResults;
    }

    interface ChronoStatic extends Chrono {
        casual: ChronoStatic;
        strict: ChronoStatic;
    }

    interface ParsedResults {
        index: number,
        text: string,
        tags: { [tag: string]: boolean },
        ref?: Date
        start: ParsedComponents,
        end: ParsedComponents
    }

    interface ParsedComponents {
        assign(component: string, value: number): void;
        imply(component: string, value: number): void;
        get(component: string): number;
        isCertain(component: string): boolean;
        date(): Date;
    }

    interface ChronoSettings {
        forwardDatesOnly: boolean
    }
}

declare module 'chrono-node' {
    const chrono: Chrono.ChronoStatic;
    export = chrono;
}
