/** @typedef {typeof __propDef.props}  CardProps */
/** @typedef {typeof __propDef.events}  CardEvents */
/** @typedef {typeof __propDef.slots}  CardSlots */
export default class Card extends SvelteComponentTyped<{
    id?: any;
    title?: any;
}, {
    [evt: string]: CustomEvent<any>;
}, {
    header: {};
    body: {};
    default: {};
    footer: {
        class: string;
    };
}> {
}
export type CardProps = typeof __propDef.props;
export type CardEvents = typeof __propDef.events;
export type CardSlots = typeof __propDef.slots;
import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: {
        id?: any;
        title?: any;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {
        header: {};
        body: {};
        default: {};
        footer: {
            class: string;
        };
    };
};
export {};
