/** @typedef {typeof __propDef.props}  SelectOneProps */
/** @typedef {typeof __propDef.events}  SelectOneEvents */
/** @typedef {typeof __propDef.slots}  SelectOneSlots */
export default class SelectOne extends SvelteComponentTyped<{
    label: any;
    options: any;
    selection: any;
    id?: any;
    variants?: string;
}, {
    select: CustomEvent<any>;
} & {
    [evt: string]: CustomEvent<any>;
}, {}> {
}
export type SelectOneProps = typeof __propDef.props;
export type SelectOneEvents = typeof __propDef.events;
export type SelectOneSlots = typeof __propDef.slots;
import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: {
        label: any;
        options: any;
        selection: any;
        id?: any;
        variants?: string;
    };
    events: {
        select: CustomEvent<any>;
    } & {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export {};
