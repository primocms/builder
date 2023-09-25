/** @typedef {typeof __propDef.props}  LocaleSelectorProps */
/** @typedef {typeof __propDef.events}  LocaleSelectorEvents */
/** @typedef {typeof __propDef.slots}  LocaleSelectorSlots */
export default class LocaleSelector extends SvelteComponentTyped<{
    align?: string;
}, {
    [evt: string]: CustomEvent<any>;
}, {}> {
}
export type LocaleSelectorProps = typeof __propDef.props;
export type LocaleSelectorEvents = typeof __propDef.events;
export type LocaleSelectorSlots = typeof __propDef.slots;
import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: {
        align?: string;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export {};
