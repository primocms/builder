export function registerProcessors(fns: any): void;
export namespace processors {
    function html(raw: any, data: any): Promise<any>;
    function css(raw: any, data: any): Promise<any>;
    function js(raw: any, options: any): Promise<any>;
}
