/** @typedef {typeof __propDef.props}  CodeMirrorProps */
/** @typedef {typeof __propDef.events}  CodeMirrorEvents */
/** @typedef {typeof __propDef.slots}  CodeMirrorSlots */
export default class CodeMirror extends SvelteComponentTyped<{
    value?: string;
    debounce?: boolean;
    style?: string;
    data?: {};
    prefix?: string;
    mode?: string;
    selection?: number;
    docs?: string;
}, {
    'tab-switch': CustomEvent<any>;
    save: CustomEvent<any>;
    refresh: CustomEvent<any>;
    change: CustomEvent<any>;
} & {
    [evt: string]: CustomEvent<any>;
}, {}> {
}
export type CodeMirrorProps = typeof __propDef.props;
export type CodeMirrorEvents = typeof __propDef.events;
export type CodeMirrorSlots = typeof __propDef.slots;
import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: {
        value?: string;
        debounce?: boolean;
        style?: string;
        data?: {};
        prefix?: string;
        mode?: string;
        selection?: number;
        docs?: string;
    };
    events: {
        'tab-switch': CustomEvent<any>;
        save: CustomEvent<any>;
        refresh: CustomEvent<any>;
        change: CustomEvent<any>;
    } & {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export {};
