/// <reference types="svelte" />
declare namespace _default {
    function register(userTypes: any): void;
    let set: (this: void, value: ({
        id: string;
        label: string;
        component: typeof import("../../field-types/Image.svelte").default;
    } | {
        id: string;
        label: string;
        component: typeof import("../../field-types/Number.svelte").default;
    } | {
        id: string;
        label: string;
        component: typeof import("../../field-types/Link.svelte").default;
    } | {
        id: string;
        label: string;
        component: typeof import("../../field-types/Information.svelte").default;
    })[]) => void;
    let subscribe: (this: void, run: import("svelte/store").Subscriber<({
        id: string;
        label: string;
        component: typeof import("../../field-types/Image.svelte").default;
    } | {
        id: string;
        label: string;
        component: typeof import("../../field-types/Number.svelte").default;
    } | {
        id: string;
        label: string;
        component: typeof import("../../field-types/Link.svelte").default;
    } | {
        id: string;
        label: string;
        component: typeof import("../../field-types/Information.svelte").default;
    })[]>, invalidate?: import("svelte/store").Invalidator<({
        id: string;
        label: string;
        component: typeof import("../../field-types/Image.svelte").default;
    } | {
        id: string;
        label: string;
        component: typeof import("../../field-types/Number.svelte").default;
    } | {
        id: string;
        label: string;
        component: typeof import("../../field-types/Link.svelte").default;
    } | {
        id: string;
        label: string;
        component: typeof import("../../field-types/Information.svelte").default;
    })[]>) => import("svelte/store").Unsubscriber;
}
export default _default;
