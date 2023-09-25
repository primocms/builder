declare function tracker(options: any): (import("@codemirror/state").Extension | StateField<any>)[];
export function balanceInward({ state, dispatch }: {
    state: any;
    dispatch: any;
}): boolean;
export function balanceOutward({ state, dispatch }: {
    state: any;
    dispatch: any;
}): boolean;
export function decrementNumber01(target: any): boolean;
export function decrementNumber1(target: any): boolean;
export function decrementNumber10(target: any): boolean;
export function enterAbbreviationMode({ state, dispatch }: {
    state: any;
    dispatch: any;
}): boolean;
export function evaluateMath({ state, dispatch }: {
    state: any;
    dispatch: any;
}): boolean;
export function expandAbbreviation({ state, dispatch }: {
    state: any;
    dispatch: any;
}): boolean;
export function goToNextEditPoint({ state, dispatch }: {
    state: any;
    dispatch: any;
}): boolean;
export function goToPreviousEditPoint({ state, dispatch }: {
    state: any;
    dispatch: any;
}): boolean;
export function goToTagPair({ state, dispatch }: {
    state: any;
    dispatch: any;
}): boolean;
export function incrementNumber01(target: any): boolean;
export function incrementNumber1(target: any): boolean;
export function incrementNumber10(target: any): boolean;
export function removeTag({ state, dispatch }: {
    state: any;
    dispatch: any;
}): boolean;
export function selectNextItem(target: any): boolean;
export function selectPreviousItem(target: any): boolean;
export function splitJoinTag({ state, dispatch }: {
    state: any;
    dispatch: any;
}): boolean;
export function toggleComment({ state, dispatch }: {
    state: any;
    dispatch: any;
}): boolean;
export function wrapWithAbbreviation(key?: string): (import("@codemirror/state").Extension | StateField<any>)[];
import { StateField } from "@codemirror/state";
export { tracker as abbreviationTracker };
