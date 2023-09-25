/** @typedef {typeof __propDef.props}  ToolbarButtonProps */
/** @typedef {typeof __propDef.events}  ToolbarButtonEvents */
/** @typedef {typeof __propDef.slots}  ToolbarButtonSlots */
export default class ToolbarButton extends SvelteComponentTyped<{
    icon?: any;
    svg?: any;
    id?: any;
    title?: string;
    label?: string;
    key?: any;
    disabled?: boolean;
    onclick?: any;
    loading?: boolean;
    active?: boolean;
    buttons?: any;
    type?: any;
    style?: string;
}, {
    click: CustomEvent<any>;
} & {
    [evt: string]: CustomEvent<any>;
}, {
    default: {};
}> {
}
export type ToolbarButtonProps = typeof __propDef.props;
export type ToolbarButtonEvents = typeof __propDef.events;
export type ToolbarButtonSlots = typeof __propDef.slots;
import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: {
        icon?: any;
        svg?: any;
        id?: any;
        title?: string;
        label?: string | null;
        key?: any;
        disabled?: boolean;
        onclick?: any;
        loading?: boolean;
        active?: boolean;
        buttons?: any;
        type?: any;
        style?: string;
    };
    events: {
        click: CustomEvent<any>;
    } & {
        [evt: string]: CustomEvent<any>;
    };
    slots: {
        default: {};
    };
};
export {};
