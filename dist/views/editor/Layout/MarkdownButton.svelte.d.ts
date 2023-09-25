/** @typedef {typeof __propDef.props}  MarkdownButtonProps */
/** @typedef {typeof __propDef.events}  MarkdownButtonEvents */
/** @typedef {typeof __propDef.slots}  MarkdownButtonSlots */
export default class MarkdownButton extends SvelteComponentTyped<{
    icon: any;
    active?: boolean;
}, {
    click: MouseEvent;
} & {
    [evt: string]: CustomEvent<any>;
}, {}> {
}
export type MarkdownButtonProps = typeof __propDef.props;
export type MarkdownButtonEvents = typeof __propDef.events;
export type MarkdownButtonSlots = typeof __propDef.slots;
import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: {
        icon: any;
        active?: boolean;
    };
    events: {
        click: MouseEvent;
    } & {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export {};
