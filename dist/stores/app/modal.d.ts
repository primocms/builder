/// <reference types="svelte" />
declare namespace _default {
    function show(type: any, componentProps?: {}, modalOptions?: {}): void;
    function hide(nav?: any): void;
    function register(modal: any): void;
    let subscribe: (this: void, run: import("svelte/store").Subscriber<{
        type: any;
        component: any;
        componentProps: {};
        header: {
            title: string;
            icon: any;
        };
        footer: any;
        variants: string;
        disableClose: boolean;
        disabledBgClose: boolean;
        maxWidth: any;
        showSwitch: boolean;
        noPadding: boolean;
    }>, invalidate?: import("svelte/store").Invalidator<{
        type: any;
        component: any;
        componentProps: {};
        header: {
            title: string;
            icon: any;
        };
        footer: any;
        variants: string;
        disableClose: boolean;
        disabledBgClose: boolean;
        maxWidth: any;
        showSwitch: boolean;
        noPadding: boolean;
    }>) => import("svelte/store").Unsubscriber;
}
export default _default;
