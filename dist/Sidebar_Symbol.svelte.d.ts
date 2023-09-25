/** @typedef {typeof __propDef.props}  SidebarSymbolProps */
/** @typedef {typeof __propDef.events}  SidebarSymbolEvents */
/** @typedef {typeof __propDef.slots}  SidebarSymbolSlots */
export default class SidebarSymbol extends SvelteComponentTyped<{
    symbol: any;
    controls_enabled?: boolean;
    header_hidden?: boolean;
}, {
    mousedown: MouseEvent;
    mouseup: MouseEvent;
    rename: CustomEvent<any>;
    duplicate: CustomEvent<any>;
    download: CustomEvent<any>;
    delete: CustomEvent<any>;
} & {
    [evt: string]: CustomEvent<any>;
}, {}> {
}
export type SidebarSymbolProps = typeof __propDef.props;
export type SidebarSymbolEvents = typeof __propDef.events;
export type SidebarSymbolSlots = typeof __propDef.slots;
import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: {
        symbol: any;
        controls_enabled?: boolean;
        header_hidden?: boolean;
    };
    events: {
        mousedown: MouseEvent;
        mouseup: MouseEvent;
        rename: CustomEvent<any>;
        duplicate: CustomEvent<any>;
        download: CustomEvent<any>;
        delete: CustomEvent<any>;
    } & {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export {};
