/** @typedef {typeof __propDef.props}  UrlProps */
/** @typedef {typeof __propDef.events}  UrlEvents */
/** @typedef {typeof __propDef.slots}  UrlSlots */
export default class Url extends SvelteComponentTyped<{
    field: any;
}, {
    input: CustomEvent<any>;
} & {
    [evt: string]: CustomEvent<any>;
}, {}> {
}
export type UrlProps = typeof __propDef.props;
export type UrlEvents = typeof __propDef.events;
export type UrlSlots = typeof __propDef.slots;
import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: {
        field: any;
    };
    events: {
        input: CustomEvent<any>;
    } & {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export {};
