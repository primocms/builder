declare const _default: ({
    id: string;
    label: string;
    component: typeof Image;
} | {
    id: string;
    label: string;
    component: typeof Number;
} | {
    id: string;
    label: string;
    component: typeof Link;
} | {
    id: string;
    label: string;
    component: typeof Information;
})[];
export default _default;
import Image from './Image.svelte';
import Number from './Number.svelte';
import Link from './Link.svelte';
import Information from './Information.svelte';
