/** @typedef {typeof __propDef.props}  PreviewProps */
/** @typedef {typeof __propDef.events}  PreviewEvents */
/** @typedef {typeof __propDef.slots}  PreviewSlots */
export default class Preview extends SvelteComponentTyped<{
    preview: any;
    preventClicks?: boolean;
    ratio?: any;
}, {
    [evt: string]: CustomEvent<any>;
}, {}> {
}
export type PreviewProps = typeof __propDef.props;
export type PreviewEvents = typeof __propDef.events;
export type PreviewSlots = typeof __propDef.slots;
import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: {
        preview: any;
        preventClicks?: boolean;
        ratio?: any;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export {};
