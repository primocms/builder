export function html({ component, buildStatic, format }: {
    component: any;
    buildStatic?: boolean;
    format?: string;
}): Promise<any>;
export function css(raw: any): Promise<{
    css: any;
    error?: undefined;
} | {
    error: any;
    css?: undefined;
}>;
