/** @typedef {typeof __propDef.props}  RepeaterFieldProps */
/** @typedef {typeof __propDef.events}  RepeaterFieldEvents */
/** @typedef {typeof __propDef.slots}  RepeaterFieldSlots */
export default class RepeaterField extends SvelteComponentTyped<{
    field: any;
    level?: number;
}, {
    input: CustomEvent<any>;
} & {
    [evt: string]: CustomEvent<any>;
}, {}> {
}
export type RepeaterFieldProps = typeof __propDef.props;
export type RepeaterFieldEvents = typeof __propDef.events;
export type RepeaterFieldSlots = typeof __propDef.slots;
import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: {
        field: any;
        level?: number;
    };
    events: {
        input: CustomEvent<any>;
    } & {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export {};
