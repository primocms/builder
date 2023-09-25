/** @typedef {typeof __propDef.props}  FeedbackProps */
/** @typedef {typeof __propDef.events}  FeedbackEvents */
/** @typedef {typeof __propDef.slots}  FeedbackSlots */
export default class Feedback extends SvelteComponentTyped<{
    [x: string]: never;
}, {
    [evt: string]: CustomEvent<any>;
}, {}> {
}
export type FeedbackProps = typeof __propDef.props;
export type FeedbackEvents = typeof __propDef.events;
export type FeedbackSlots = typeof __propDef.slots;
import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: {
        [x: string]: never;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export {};
