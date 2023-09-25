/** @typedef {typeof __propDef.props}  TextFieldProps */
/** @typedef {typeof __propDef.events}  TextFieldEvents */
/** @typedef {typeof __propDef.slots}  TextFieldSlots */
export default class TextField extends SvelteComponentTyped<{
    [x: string]: any;
    value: any;
    label: any;
    size?: string;
    disabled?: boolean;
    type?: string;
    variants?: string;
}, {
    input: CustomEvent<any>;
} & {
    [evt: string]: CustomEvent<any>;
}, {
    default: {};
}> {
}
export type TextFieldProps = typeof __propDef.props;
export type TextFieldEvents = typeof __propDef.events;
export type TextFieldSlots = typeof __propDef.slots;
import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: {
        [x: string]: any;
        value: any;
        label: any;
        size?: string;
        disabled?: boolean;
        type?: string;
        variants?: string;
    };
    events: {
        input: CustomEvent<any>;
    } & {
        [evt: string]: CustomEvent<any>;
    };
    slots: {
        default: {};
    };
};
export {};
