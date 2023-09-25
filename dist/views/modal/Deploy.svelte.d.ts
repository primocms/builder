/** @typedef {typeof __propDef.props}  DeployProps */
/** @typedef {typeof __propDef.events}  DeployEvents */
/** @typedef {typeof __propDef.slots}  DeploySlots */
export default class Deploy extends SvelteComponentTyped<{
    [x: string]: never;
}, {
    [evt: string]: CustomEvent<any>;
}, {}> {
}
export type DeployProps = typeof __propDef.props;
export type DeployEvents = typeof __propDef.events;
export type DeploySlots = typeof __propDef.slots;
import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: {
        [x: string]: never;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export {};
