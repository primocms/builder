/** @typedef {typeof __propDef.props}  ColorPickerProps */
/** @typedef {typeof __propDef.events}  ColorPickerEvents */
/** @typedef {typeof __propDef.slots}  ColorPickerSlots */
export default class ColorPicker extends SvelteComponentTyped<{
    field: any;
}, {
    input: CustomEvent<any>;
    save: CustomEvent<any>;
} & {
    [evt: string]: CustomEvent<any>;
}, {}> {
}
export type ColorPickerProps = typeof __propDef.props;
export type ColorPickerEvents = typeof __propDef.events;
export type ColorPickerSlots = typeof __propDef.slots;
import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: {
        field: any;
    };
    events: {
        input: CustomEvent<any>;
        save: CustomEvent<any>;
    } & {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export {};
