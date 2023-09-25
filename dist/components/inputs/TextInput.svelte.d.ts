/** @typedef {typeof __propDef.props}  TextInputProps */
/** @typedef {typeof __propDef.events}  TextInputEvents */
/** @typedef {typeof __propDef.slots}  TextInputSlots */
export default class TextInput extends SvelteComponentTyped<{
    value: string;
    id?: string;
    label?: string;
    type?: string;
    variants?: string;
    prefix?: string;
    placeholder?: string;
    autofocus?: boolean;
}, {
    input: CustomEvent<any>;
} & {
    [evt: string]: CustomEvent<any>;
}, {}> {
}
export type TextInputProps = typeof __propDef.props;
export type TextInputEvents = typeof __propDef.events;
export type TextInputSlots = typeof __propDef.slots;
import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: {
        value: string;
        id?: string | null;
        label?: string | null;
        type?: string;
        variants?: string;
        prefix?: string;
        placeholder?: string;
        autofocus?: boolean;
    };
    events: {
        input: CustomEvent<any>;
    } & {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export {};
