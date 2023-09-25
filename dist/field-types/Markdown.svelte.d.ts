/** @typedef {typeof __propDef.props}  MarkdownProps */
/** @typedef {typeof __propDef.events}  MarkdownEvents */
/** @typedef {typeof __propDef.slots}  MarkdownSlots */
export default class Markdown extends SvelteComponentTyped<{
    field: any;
}, {
    input: CustomEvent<any>;
    save: CustomEvent<any>;
} & {
    [evt: string]: CustomEvent<any>;
}, {}> {
}
export type MarkdownProps = typeof __propDef.props;
export type MarkdownEvents = typeof __propDef.events;
export type MarkdownSlots = typeof __propDef.slots;
import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: {
        field: any;
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
