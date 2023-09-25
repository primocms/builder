/** @typedef {typeof __propDef.props}  SubFieldProps */
/** @typedef {typeof __propDef.events}  SubFieldEvents */
/** @typedef {typeof __propDef.slots}  SubFieldSlots */
export default class SubField extends SvelteComponentTyped<{
    disabled?: boolean;
}, {
    delete: CustomEvent<any>;
} & {
    [evt: string]: CustomEvent<any>;
}, {
    type: {};
    label: {};
    key: {};
}> {
}
export type SubFieldProps = typeof __propDef.props;
export type SubFieldEvents = typeof __propDef.events;
export type SubFieldSlots = typeof __propDef.slots;
import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: {
        disabled?: boolean;
    };
    events: {
        delete: CustomEvent<any>;
    } & {
        [evt: string]: CustomEvent<any>;
    };
    slots: {
        type: {};
        label: {};
        key: {};
    };
};
export {};
