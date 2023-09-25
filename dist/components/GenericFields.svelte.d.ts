/** @typedef {typeof __propDef.props}  GenericFieldsProps */
/** @typedef {typeof __propDef.events}  GenericFieldsEvents */
/** @typedef {typeof __propDef.slots}  GenericFieldsSlots */
export default class GenericFields extends SvelteComponentTyped<{
    fields: any;
    showCode?: boolean;
}, {
    save: any;
    input: CustomEvent<any>;
    delete: CustomEvent<any>;
} & {
    [evt: string]: CustomEvent<any>;
}, {}> {
}
export type GenericFieldsProps = typeof __propDef.props;
export type GenericFieldsEvents = typeof __propDef.events;
export type GenericFieldsSlots = typeof __propDef.slots;
import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: {
        fields: any;
        showCode?: boolean;
    };
    events: {
        save: any;
        input: CustomEvent<any>;
        delete: CustomEvent<any>;
    } & {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export {};
