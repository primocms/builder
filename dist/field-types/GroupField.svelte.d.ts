/** @typedef {typeof __propDef.props}  GroupFieldProps */
/** @typedef {typeof __propDef.events}  GroupFieldEvents */
/** @typedef {typeof __propDef.slots}  GroupFieldSlots */
export default class GroupField extends SvelteComponentTyped<{
    field: any;
    level?: number;
}, {
    input: CustomEvent<any>;
} & {
    [evt: string]: CustomEvent<any>;
}, {}> {
}
export type GroupFieldProps = typeof __propDef.props;
export type GroupFieldEvents = typeof __propDef.events;
export type GroupFieldSlots = typeof __propDef.slots;
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
