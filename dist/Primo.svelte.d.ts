/** @typedef {typeof __propDef.props}  PrimoProps */
/** @typedef {typeof __propDef.events}  PrimoEvents */
/** @typedef {typeof __propDef.slots}  PrimoSlots */
export default class Primo extends SvelteComponentTyped<{
    data: {
        site: any;
        pages: any[];
        symbols: any[];
    };
    role?: string;
}, {
    [evt: string]: CustomEvent<any>;
}, {
    toolbar: {};
    default: {};
}> {
}
export type PrimoProps = typeof __propDef.props;
export type PrimoEvents = typeof __propDef.events;
export type PrimoSlots = typeof __propDef.slots;
import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: {
        data: {
            site: import('./').Site;
            pages: Array<import('./').Page>;
            symbols: Array<import('./').Symbol>;
        };
        role?: string;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {
        toolbar: {};
        default: {};
    };
};
export {};
