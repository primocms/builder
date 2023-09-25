export const VERSION: "3.59.1";
export function compile(e: any, t?: {}): {
    js: {
        code: string;
        map: {
            version: number;
            names: any[];
            sources: any[];
            sourcesContent: any[];
            mappings: string | any[][][];
        };
    };
    css: any;
    ast: any;
    warnings: any;
    vars: {
        name: any;
        export_name: any;
        injected: any;
        module: any;
        mutated: any;
        reassigned: any;
        referenced: any;
        writable: any;
        referenced_from_script: any;
    }[];
    stats: any;
};
declare function parse$b(e: any, t?: {}): {
    html: {
        start: any;
        end: any;
        type: string;
        children: any[];
    };
    css: any;
    instance: any;
    module: any;
};
export function preprocess(e: any, t: any, n: any): Promise<{
    code: any;
    dependencies: any[];
    map: SourceMap;
    toString: () => any;
}>;
export function walk(e: any, { enter: t, leave: n }: {
    enter: any;
    leave: any;
}): any;
declare class SourceMap {
    constructor(e: any, t: any);
    version: number;
    file: any;
    mappings: string;
    names: any;
    sources: any;
    sourcesContent: any;
    toString(): string;
}
export { parse$b as parse };
