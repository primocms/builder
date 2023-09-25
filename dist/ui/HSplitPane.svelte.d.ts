/** @typedef {typeof __propDef.props}  HSplitPaneProps */
/** @typedef {typeof __propDef.events}  HSplitPaneEvents */
/** @typedef {typeof __propDef.slots}  HSplitPaneSlots */
export default class HSplitPane extends SvelteComponentTyped<{
    style?: string;
    orientation?: string;
    resetSize?: () => void;
    updateCallback?: () => void;
    hideRightPanel?: boolean;
    leftPaneSize?: string;
    minLeftPaneSize?: string;
    centerPaneSize?: string;
    minCenterPaneSize?: string;
    rightPaneSize?: string;
    minRightPaneSize?: string;
    topPaneSize?: string;
    bottomPaneSize?: string;
    hideLeftOverflow?: boolean;
}, {
    mousedown: CustomEvent<any>;
} & {
    [evt: string]: CustomEvent<any>;
}, {
    left: {};
    center: {};
    right: {};
}> {
}
export type HSplitPaneProps = typeof __propDef.props;
export type HSplitPaneEvents = typeof __propDef.events;
export type HSplitPaneSlots = typeof __propDef.slots;
import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: {
        style?: string;
        orientation?: string;
        resetSize?: () => void;
        updateCallback?: () => void;
        hideRightPanel?: boolean;
        leftPaneSize?: string;
        minLeftPaneSize?: string;
        centerPaneSize?: string;
        minCenterPaneSize?: string;
        rightPaneSize?: string;
        minRightPaneSize?: string;
        topPaneSize?: string;
        bottomPaneSize?: string;
        hideLeftOverflow?: boolean;
    };
    events: {
        mousedown: CustomEvent<any>;
    } & {
        [evt: string]: CustomEvent<any>;
    };
    slots: {
        left: {};
        center: {};
        right: {};
    };
};
export {};
