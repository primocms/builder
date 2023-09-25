/** @typedef {typeof __propDef.props}  IFrameProps */
/** @typedef {typeof __propDef.events}  IFrameEvents */
/** @typedef {typeof __propDef.slots}  IFrameSlots */
export default class IFrame extends SvelteComponentTyped<{
    componentCode: any;
    height: any;
}, {
    [evt: string]: CustomEvent<any>;
}, {}> {
}
export type IFrameProps = typeof __propDef.props;
export type IFrameEvents = typeof __propDef.events;
export type IFrameSlots = typeof __propDef.slots;
import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: {
        componentCode: any;
        height: any;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export {};
