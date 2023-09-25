/** @typedef {typeof __propDef.props}  ItemProps */
/** @typedef {typeof __propDef.events}  ItemEvents */
/** @typedef {typeof __propDef.slots}  ItemSlots */
export default class Item extends SvelteComponentTyped<{
    active: any;
    page: any;
    parent?: any;
    children?: any[];
    parent_urls?: string[];
}, {
    delete: CustomEvent<any>;
    create: CustomEvent<any>;
} & {
    [evt: string]: CustomEvent<any>;
}, {}> {
}
export type ItemProps = typeof __propDef.props;
export type ItemEvents = typeof __propDef.events;
export type ItemSlots = typeof __propDef.slots;
import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: {
        active: any;
        page: any;
        parent?: import('../../../..').Page | null;
        children?: any[];
        parent_urls?: string[];
    };
    events: {
        delete: CustomEvent<any>;
        create: CustomEvent<any>;
    } & {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export {};
