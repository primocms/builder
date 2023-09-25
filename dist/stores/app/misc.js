import {writable} from 'svelte/store'

export const saved = writable(true)

export const showingIDE = writable(false)

export const userRole = writable('DEV')

export const showKeyHint = writable(false)

export const loadingSite = writable(false)

export const onMobile = !import.meta.env.SSR ? writable(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) : writable(false)

export const locale = writable('en')

export const highlightedElement = writable(null)

export const locked_blocks = writable([])