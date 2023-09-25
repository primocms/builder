/** @typedef {typeof __propDef.props}  DialogProps */
/** @typedef {typeof __propDef.events}  DialogEvents */
/** @typedef {typeof __propDef.slots}  DialogSlots */
export default class Dialog extends SvelteComponentTyped<{
    component: any;
    onSubmit: any;
    options?: {
        disableClose: boolean;
    };
    props?: {};
}, {
    [evt: string]: CustomEvent<any>;
}, {}> {
}
export type DialogProps = typeof __propDef.props;
export type DialogEvents = typeof __propDef.events;
export type DialogSlots = typeof __propDef.slots;
import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: {
        component: any;
        onSubmit: any;
        options?: {
            disableClose: boolean;
        };
        props?: {};
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export {};
