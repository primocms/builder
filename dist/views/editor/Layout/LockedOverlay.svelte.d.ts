/** @typedef {typeof __propDef.props}  LockedOverlayProps */
/** @typedef {typeof __propDef.events}  LockedOverlayEvents */
/** @typedef {typeof __propDef.slots}  LockedOverlaySlots */
export default class LockedOverlay extends SvelteComponentTyped<{
    locked: any;
}, {
    [evt: string]: CustomEvent<any>;
}, {}> {
}
export type LockedOverlayProps = typeof __propDef.props;
export type LockedOverlayEvents = typeof __propDef.events;
export type LockedOverlaySlots = typeof __propDef.slots;
import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: {
        locked: any;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export {};
