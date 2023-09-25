/// <reference types="svelte" />
export function createStack(current: any): {
    set: (value: any) => any;
    /** @param {T | ((current: T) => T)} value */
    push: (value: any) => any;
    undo: () => any;
    redo: () => any;
    subscribe: (this: void, run: import("svelte/store").Subscriber<{
        first: boolean;
        last: boolean;
        current: any;
    }>, invalidate?: import("svelte/store").Invalidator<{
        first: boolean;
        last: boolean;
        current: any;
    }>) => import("svelte/store").Unsubscriber;
};
