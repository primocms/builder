/** @typedef {typeof __propDef.props}  SelectFieldProps */
/** @typedef {typeof __propDef.events}  SelectFieldEvents */
/** @typedef {typeof __propDef.slots}  SelectFieldSlots */
export default class SelectField extends SvelteComponentTyped<{
    field: any;
    level: any;
}, {
    input: CustomEvent<any>;
} & {
    [evt: string]: CustomEvent<any>;
}, {}> {
}
export type SelectFieldProps = typeof __propDef.props;
export type SelectFieldEvents = typeof __propDef.events;
export type SelectFieldSlots = typeof __propDef.slots;
import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: {
        field: any;
        level: any;
    };
    events: {
        input: CustomEvent<any>;
    } & {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export {};
