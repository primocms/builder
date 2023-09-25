/** @typedef {typeof __propDef.props}  NumberProps */
/** @typedef {typeof __propDef.events}  NumberEvents */
/** @typedef {typeof __propDef.slots}  NumberSlots */
export default class Number extends SvelteComponentTyped<{
    field: any;
}, {
    input: CustomEvent<any>;
} & {
    [evt: string]: CustomEvent<any>;
}, {}> {
}
export type NumberProps = typeof __propDef.props;
export type NumberEvents = typeof __propDef.events;
export type NumberSlots = typeof __propDef.slots;
import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: {
        field: any;
    };
    events: {
        input: CustomEvent<any>;
    } & {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export {};
