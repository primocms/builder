/** @typedef {typeof __propDef.props}  SplitButtonProps */
/** @typedef {typeof __propDef.events}  SplitButtonEvents */
/** @typedef {typeof __propDef.slots}  SplitButtonSlots */
export default class SplitButton extends SvelteComponentTyped<{
    selected: any;
    buttons?: {
        id: string;
    }[];
}, {
    [evt: string]: CustomEvent<any>;
}, {}> {
}
export type SplitButtonProps = typeof __propDef.props;
export type SplitButtonEvents = typeof __propDef.events;
export type SplitButtonSlots = typeof __propDef.slots;
import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: {
        selected: any;
        buttons?: {
            id: string;
        }[];
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export {};
