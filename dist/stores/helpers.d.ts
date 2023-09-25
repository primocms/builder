export function getSymbolUseInfo(symbolID: any): {
    pages: any[];
    frequency: number;
};
export function getSymbol(symbolID: any): any;
/**
 * @param {{
 *  page?: import('..').Page
 *  site?: import('..').Site
 *  page_sections?: import('..').Section[]
 *  page_symbols?: import('..').Symbol[]
 *  locale?: string
 *  no_js?: boolean
 * }} details
 * @returns {Promise<{ html: string, js: string}>}
 * */
export function buildStaticPage({ page, site, page_sections, page_symbols, locale, no_js }: {
    page?: import('..').Page;
    site?: import('..').Site;
    page_sections?: import('..').Section[];
    page_symbols?: import('..').Symbol[];
    locale?: string;
    no_js?: boolean;
}): Promise<{
    html: string;
    js: string;
}>;
export function get_content_with_static({ component, symbol, loc }: {
    component: any;
    symbol: any;
    loc?: string;
}): any;
export function getPageData({ page, site, loc }: {
    page?: {
        id: any;
        name: any;
        url: any;
        code: any;
        content: any;
        fields: any;
    };
    site?: any;
    loc?: string;
}): any;
import { locale } from './app/misc.js';
