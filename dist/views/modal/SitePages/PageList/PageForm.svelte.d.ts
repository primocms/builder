/** @typedef {typeof __propDef.props}  PageFormProps */
/** @typedef {typeof __propDef.events}  PageFormEvents */
/** @typedef {typeof __propDef.slots}  PageFormSlots */
export default class PageForm extends SvelteComponentTyped<{
    page?: any;
}, {
    create: CustomEvent<any>;
} & {
    [evt: string]: CustomEvent<any>;
}, {}> {
}
export type PageFormProps = typeof __propDef.props;
export type PageFormEvents = typeof __propDef.events;
export type PageFormSlots = typeof __propDef.slots;
import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: {
        page?: import('../../../..').Page | null;
    };
    events: {
        create: CustomEvent<any>;
    } & {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export {};
