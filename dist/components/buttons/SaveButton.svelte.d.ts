/** @typedef {typeof __propDef.props}  SaveButtonProps */
/** @typedef {typeof __propDef.events}  SaveButtonEvents */
/** @typedef {typeof __propDef.slots}  SaveButtonSlots */
export default class SaveButton extends SvelteComponentTyped<{
    disabled?: boolean;
    loading?: boolean;
    type?: string;
    variants?: string;
}, {
    click: CustomEvent<any>;
} & {
    [evt: string]: CustomEvent<any>;
}, {
    default: {};
}> {
}
export type SaveButtonProps = typeof __propDef.props;
export type SaveButtonEvents = typeof __propDef.events;
export type SaveButtonSlots = typeof __propDef.slots;
import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: {
        disabled?: boolean;
        loading?: boolean;
        type?: string;
        variants?: string;
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
