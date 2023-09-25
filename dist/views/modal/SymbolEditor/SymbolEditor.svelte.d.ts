/** @typedef {typeof __propDef.props}  SymbolEditorProps */
/** @typedef {typeof __propDef.events}  SymbolEditorEvents */
/** @typedef {typeof __propDef.slots}  SymbolEditorSlots */
export default class SymbolEditor extends SvelteComponentTyped<{
    symbol: any;
    header?: {
        label: string;
        icon: string;
        button: {
            icon: string;
            label: string;
            onclick: (symbol: any) => void;
        };
    };
}, {
    [evt: string]: CustomEvent<any>;
}, {}> {
}
export type SymbolEditorProps = typeof __propDef.props;
export type SymbolEditorEvents = typeof __propDef.events;
export type SymbolEditorSlots = typeof __propDef.slots;
import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: {
        symbol: any;
        header?: {
            label: string;
            icon: string;
            button: {
                icon: string;
                label: string;
                onclick: (symbol: any) => void;
            };
        };
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export {};
