declare namespace PouchDB {
    namespace Search {
        interface BuildOptions {
            fields: string[],
            build: true
        }

        interface SearchOptions {
            fields: string[] | { [key: string]: number },
            query?: string,
            limit?: number,
            skip?: number,
            include_docs?: boolean,
            highlighting?: boolean,
            highlighting_pre?: string,
            mm?: string,
            filter?: (doc: any) => boolean,
            destroy?: boolean,
            stale?: "ok" | "update_after",
            language?: string | string[]
        }

        interface SearchResponse<T> {
            rows: {
                "id": string,
                "score": number,
                "doc"?: T,
                "highlighting"?: { [key: string]: string }
            }[],
            total_rows: number
        }

        interface BuildResponse {
            ok: boolean
        }
    }

    interface Database<Content extends Core.Encodable> {
        search(options: Search.SearchOptions,
               callback: Core.Callback<any, Search.SearchResponse<Content>>): void;
        search(options: Search.SearchOptions): Promise<Search.SearchResponse<Content>>;

        search(options: Search.BuildOptions,
               callback: Core.Callback<any, Search.BuildResponse>): void;
        search(options: Search.BuildOptions): Promise<Search.BuildResponse>;

        search(options: Search.SearchOptions | Search.BuildOptions,
               callback: Core.Callback<any, Search.SearchResponse<Content>> | Search.BuildResponse): void;
        search(options: Search.SearchOptions | Search.BuildOptions): Promise<Search.SearchResponse<Content> | Search.BuildResponse>;
    }
}

declare module 'pouchdb-quick-search' {
    const plugin: PouchDB.Plugin;
    export = plugin;
}
