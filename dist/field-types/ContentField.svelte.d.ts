/** @typedef {typeof __propDef.props}  ContentFieldProps */
/** @typedef {typeof __propDef.events}  ContentFieldEvents */
/** @typedef {typeof __propDef.slots}  ContentFieldSlots */
export default class ContentField extends SvelteComponentTyped<{
    field: any;
    value?: any;
    title?: any;
    disabled?: boolean;
    variants?: string;
    onChange?: () => void;
}, {
    input: CustomEvent<any>;
    save: CustomEvent<any>;
} & {
    [evt: string]: CustomEvent<any>;
}, {}> {
}
export type ContentFieldProps = typeof __propDef.props;
export type ContentFieldEvents = typeof __propDef.events;
export type ContentFieldSlots = typeof __propDef.slots;
import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: {
        field: any;
        value?: any;
        title?: any;
        disabled?: boolean;
        variants?: string;
        onChange?: () => void;
    };
    events: {
        input: CustomEvent<any>;
        save: CustomEvent<any>;
    } & {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export {};
