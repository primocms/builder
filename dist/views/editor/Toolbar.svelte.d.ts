/** @typedef {typeof __propDef.props}  ToolbarProps */
/** @typedef {typeof __propDef.events}  ToolbarEvents */
/** @typedef {typeof __propDef.slots}  ToolbarSlots */
export default class Toolbar extends SvelteComponentTyped<{
    [x: string]: never;
}, {
    signOut: CustomEvent<any>;
} & {
    [evt: string]: CustomEvent<any>;
}, {
    default: {};
}> {
}
export type ToolbarProps = typeof __propDef.props;
export type ToolbarEvents = typeof __propDef.events;
export type ToolbarSlots = typeof __propDef.slots;
import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: {
        [x: string]: never;
    };
    events: {
        signOut: CustomEvent<any>;
    } & {
        [evt: string]: CustomEvent<any>;
    };
    slots: {
        default: {};
    };
};
export {};
