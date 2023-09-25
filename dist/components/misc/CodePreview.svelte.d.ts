export const autoRefresh: import("svelte/store").Writable<boolean>;
/** @typedef {typeof __propDef.props}  CodePreviewProps */
/** @typedef {typeof __propDef.events}  CodePreviewEvents */
/** @typedef {typeof __propDef.slots}  CodePreviewSlots */
export default class CodePreview extends SvelteComponentTyped<{
    error?: any;
    loading?: boolean;
    data?: {};
    componentApp?: any;
    view?: string;
    orientation?: string;
    hideControls?: boolean;
    preview?: any;
}, {
    [evt: string]: CustomEvent<any>;
}, {}> {
}
export type CodePreviewProps = typeof __propDef.props;
export type CodePreviewEvents = typeof __propDef.events;
export type CodePreviewSlots = typeof __propDef.slots;
import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: {
        error?: any;
        loading?: boolean;
        data?: {};
        componentApp?: any;
        view?: string;
        orientation?: string;
        hideControls?: boolean;
        preview?: any;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export {};
