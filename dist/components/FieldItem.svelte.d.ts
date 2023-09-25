/** @typedef {typeof __propDef.props}  FieldItemProps */
/** @typedef {typeof __propDef.events}  FieldItemEvents */
/** @typedef {typeof __propDef.slots}  FieldItemSlots */
export default class FieldItem extends SvelteComponentTyped<{
    field: any;
    isFirst: any;
    isLast: any;
    options?: any[];
    level?: number;
    top_level?: boolean;
}, {
    duplicate: CustomEvent<any>;
    delete: CustomEvent<any>;
    move: CustomEvent<any>;
    createsubfield: CustomEvent<any>;
    input: CustomEvent<any>;
} & {
    [evt: string]: CustomEvent<any>;
}, {}> {
}
export type FieldItemProps = typeof __propDef.props;
export type FieldItemEvents = typeof __propDef.events;
export type FieldItemSlots = typeof __propDef.slots;
import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: {
        field: any;
        isFirst: any;
        isLast: any;
        options?: any[];
        level?: number;
        top_level?: boolean;
    };
    events: {
        duplicate: CustomEvent<any>;
        delete: CustomEvent<any>;
        move: CustomEvent<any>;
        createsubfield: CustomEvent<any>;
        input: CustomEvent<any>;
    } & {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export {};
