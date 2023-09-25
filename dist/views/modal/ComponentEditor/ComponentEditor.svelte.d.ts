/** @typedef {typeof __propDef.props}  ComponentEditorProps */
/** @typedef {typeof __propDef.events}  ComponentEditorEvents */
/** @typedef {typeof __propDef.slots}  ComponentEditorSlots */
export default class ComponentEditor extends SvelteComponentTyped<{
    component: any;
    header?: {
        label: string;
        icon: string;
        button: {
            icon: string;
            label: string;
            onclick: (component: any) => void;
        };
    };
}, {
    [evt: string]: CustomEvent<any>;
}, {}> {
}
export type ComponentEditorProps = typeof __propDef.props;
export type ComponentEditorEvents = typeof __propDef.events;
export type ComponentEditorSlots = typeof __propDef.slots;
import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: {
        component: any;
        header?: {
            label: string;
            icon: string;
            button: {
                icon: string;
                label: string;
                onclick: (component: any) => void;
            };
        };
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export {};
