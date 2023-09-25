/// <reference types="svelte" />
export function set(val: any): void;
export const id: import("svelte/store").Writable<string>;
export const name: import("svelte/store").Writable<string>;
export const url: import("svelte/store").Writable<string>;
export const code: import("svelte/store").Writable<any>;
export const content: import("svelte/store").Writable<{
    en: {};
}>;
export const fields: import("svelte/store").Writable<any>;
declare const _default: import("svelte/store").Readable<{
    id: any;
    name: any;
    url: any;
    code: any;
    content: any;
    fields: any;
}>;
export default _default;
