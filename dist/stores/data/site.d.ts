/// <reference types="svelte" />
export function update(props: any): void;
export const id: import("svelte/store").Writable<string>;
export const url: import("svelte/store").Writable<string>;
export const name: import("svelte/store").Writable<string>;
export const fields: import("svelte/store").Writable<any[]>;
export const code: import("svelte/store").Writable<any>;
export const content: import("svelte/store").Writable<any>;
export const active_deployment: import("svelte/store").Writable<any>;
/** @type {import('svelte/store').Readable<import('../..').Site>} */
export const site: import('svelte/store').Readable<import('../..').Site>;
export default site;
