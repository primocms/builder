/** @typedef {typeof __propDef.props}  PrimaryButtonProps */
/** @typedef {typeof __propDef.events}  PrimaryButtonEvents */
/** @typedef {typeof __propDef.slots}  PrimaryButtonSlots */
export default class PrimaryButton extends SvelteComponentTyped<{
    [x: string]: any;
    icon?: any;
    id?: any;
    label?: string;
    disabled?: boolean;
    loading?: boolean;
    type?: string;
    variants?: string;
}, {
    change: Event;
    click: MouseEvent;
} & {
    [evt: string]: CustomEvent<any>;
}, {
    icon: {};
    label: {};
    default: {};
}> {
}
export type PrimaryButtonProps = typeof __propDef.props;
export type PrimaryButtonEvents = typeof __propDef.events;
export type PrimaryButtonSlots = typeof __propDef.slots;
import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: {
        [x: string]: any;
        icon?: any;
        id?: any;
        label?: string;
        disabled?: boolean;
        loading?: boolean;
        type?: string;
        variants?: string;
    };
    events: {
        change: Event;
        click: MouseEvent;
    } & {
        [evt: string]: CustomEvent<any>;
    };
    slots: {
        icon: {};
        label: {};
        default: {};
    };
};
export {};
