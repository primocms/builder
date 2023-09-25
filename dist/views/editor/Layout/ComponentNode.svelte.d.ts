/** @typedef {typeof __propDef.props}  ComponentNodeProps */
/** @typedef {typeof __propDef.events}  ComponentNodeEvents */
/** @typedef {typeof __propDef.slots}  ComponentNodeSlots */
export default class ComponentNode extends SvelteComponentTyped<{
    block: any;
    primo_symbol?: any;
}, {
    lock: CustomEvent<any>;
    unlock: CustomEvent<any>;
    mount: CustomEvent<any>;
    resize: CustomEvent<any>;
} & {
    [evt: string]: CustomEvent<any>;
}, {}> {
}
export type ComponentNodeProps = typeof __propDef.props;
export type ComponentNodeEvents = typeof __propDef.events;
export type ComponentNodeSlots = typeof __propDef.slots;
import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: {
        block: any;
        primo_symbol?: any;
    };
    events: {
        lock: CustomEvent<any>;
        unlock: CustomEvent<any>;
        mount: CustomEvent<any>;
        resize: CustomEvent<any>;
    } & {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export {};
