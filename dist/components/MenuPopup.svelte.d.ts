/** @typedef {typeof __propDef.props}  MenuPopupProps */
/** @typedef {typeof __propDef.events}  MenuPopupEvents */
/** @typedef {typeof __propDef.slots}  MenuPopupSlots */
export default class MenuPopup extends SvelteComponentTyped<{
    icon?: string;
    options?: any[];
}, {
    [evt: string]: CustomEvent<any>;
}, {}> {
}
export type MenuPopupProps = typeof __propDef.props;
export type MenuPopupEvents = typeof __propDef.events;
export type MenuPopupSlots = typeof __propDef.slots;
import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: {
        icon?: string;
        options?: any[];
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export {};
