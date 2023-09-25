export function processCode({ component, buildStatic, format, locale, hydrated, ignoreCachedData }: {
    component: any;
    buildStatic?: boolean;
    format?: string;
    locale?: string;
    hydrated?: boolean;
    ignoreCachedData?: boolean;
}): Promise<any>;
export function processCSS(raw: any): Promise<any>;
export function createDebouncer(time: any): any;
export function wrapInStyleTags(css: any, id: any): string;
export function getEmptyValue(field: any): any;
export function convert_html_to_markdown(html: any): Promise<any>;
export function convert_markdown_to_html(markdown: any): Promise<any>;
