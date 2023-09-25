/** @typedef {typeof __propDef.props}  EditFieldProps */
/** @typedef {typeof __propDef.events}  EditFieldEvents */
/** @typedef {typeof __propDef.slots}  EditFieldSlots */
export default class EditField extends SvelteComponentTyped<{
    level: any;
    child?: boolean;
    minimal?: boolean;
    showVisibilityOptions?: boolean;
    top_level?: boolean;
    has_subfields?: boolean;
}, {
    move: CustomEvent<any>;
    duplicate: CustomEvent<any>;
    delete: CustomEvent<any>;
} & {
    [evt: string]: CustomEvent<any>;
}, {
    type: {};
    main: {};
    label: {};
    key: {};
    toggle: {};
    default: {};
}> {
}
export type EditFieldProps = typeof __propDef.props;
export type EditFieldEvents = typeof __propDef.events;
export type EditFieldSlots = typeof __propDef.slots;
import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: {
        level: any;
        child?: boolean;
        minimal?: boolean;
        showVisibilityOptions?: boolean;
        top_level?: boolean;
        has_subfields?: boolean;
    };
    events: {
        move: CustomEvent<any>;
        duplicate: CustomEvent<any>;
        delete: CustomEvent<any>;
    } & {
        [evt: string]: CustomEvent<any>;
    };
    slots: {
        type: {};
        main: {};
        label: {};
        key: {};
        toggle: {};
        default: {};
    };
};
export {};
