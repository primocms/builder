/** @typedef {typeof __propDef.props}  FullCodeEditorProps */
/** @typedef {typeof __propDef.events}  FullCodeEditorEvents */
/** @typedef {typeof __propDef.slots}  FullCodeEditorSlots */
export default class FullCodeEditor extends SvelteComponentTyped<{
    data?: {};
    html?: string;
    css?: string;
    js?: string;
    variants?: string;
}, {
    save: any;
    refresh: any;
    htmlChange: CustomEvent<any>;
    cssChange: CustomEvent<any>;
    jsChange: CustomEvent<any>;
} & {
    [evt: string]: CustomEvent<any>;
}, {}> {
}
export type FullCodeEditorProps = typeof __propDef.props;
export type FullCodeEditorEvents = typeof __propDef.events;
export type FullCodeEditorSlots = typeof __propDef.slots;
import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: {
        data?: {};
        html?: string;
        css?: string;
        js?: string;
        variants?: string;
    };
    events: {
        save: any;
        refresh: any;
        htmlChange: CustomEvent<any>;
        cssChange: CustomEvent<any>;
        jsChange: CustomEvent<any>;
    } & {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export {};
