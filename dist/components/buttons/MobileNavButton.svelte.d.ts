/** @typedef {typeof __propDef.props}  MobileNavButtonProps */
/** @typedef {typeof __propDef.events}  MobileNavButtonEvents */
/** @typedef {typeof __propDef.slots}  MobileNavButtonSlots */
export default class MobileNavButton extends SvelteComponentTyped<{
    [x: string]: never;
}, {
    click: CustomEvent<any>;
} & {
    [evt: string]: CustomEvent<any>;
}, {}> {
}
export type MobileNavButtonProps = typeof __propDef.props;
export type MobileNavButtonEvents = typeof __propDef.events;
export type MobileNavButtonSlots = typeof __propDef.slots;
import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: {
        [x: string]: never;
    };
    events: {
        click: CustomEvent<any>;
    } & {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export {};
