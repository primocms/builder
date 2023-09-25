/// <reference types="svelte" />
/** @param {{ doing: () => Promise<void>, undoing: () => Promise<void> }} functions */
export function update_timeline({ doing, undoing }: {
    doing: () => Promise<void>;
    undoing: () => Promise<void>;
}): Promise<void>;
declare namespace _default {
    export { site };
    export { pages };
    export { sections };
    export { symbols };
}
export default _default;
export let timeline: {
    set: (value: any) => any;
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
import site from './site';
import pages from './pages';
import sections from './sections';
import symbols from './symbols';
