/** @typedef {typeof __propDef.props}  BlockToolbarProps */
/** @typedef {typeof __propDef.events}  BlockToolbarEvents */
/** @typedef {typeof __propDef.slots}  BlockToolbarSlots */
export default class BlockToolbar extends SvelteComponentTyped<{
    id: any;
    i: any;
    node?: any;
}, {
    'edit-content': CustomEvent<any>;
    'edit-code': CustomEvent<any>;
    delete: CustomEvent<any>;
    duplicate: CustomEvent<any>;
    moveUp: CustomEvent<any>;
    moveDown: CustomEvent<any>;
} & {
    [evt: string]: CustomEvent<any>;
}, {}> {
}
export type BlockToolbarProps = typeof __propDef.props;
export type BlockToolbarEvents = typeof __propDef.events;
export type BlockToolbarSlots = typeof __propDef.slots;
import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: {
        id: any;
        i: any;
        node?: any;
    };
    events: {
        'edit-content': CustomEvent<any>;
        'edit-code': CustomEvent<any>;
        delete: CustomEvent<any>;
        duplicate: CustomEvent<any>;
        moveUp: CustomEvent<any>;
        moveDown: CustomEvent<any>;
    } & {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export {};
