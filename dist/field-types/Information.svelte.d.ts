/** @typedef {typeof __propDef.props}  InformationProps */
/** @typedef {typeof __propDef.events}  InformationEvents */
/** @typedef {typeof __propDef.slots}  InformationSlots */
export default class Information extends SvelteComponentTyped<{
    field?: {
        options: {
            info: string;
        };
    };
}, {
    [evt: string]: CustomEvent<any>;
}, {}> {
}
export type InformationProps = typeof __propDef.props;
export type InformationEvents = typeof __propDef.events;
export type InformationSlots = typeof __propDef.slots;
import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: {
        field?: {
            options: {
                info: string;
            };
        };
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export {};
