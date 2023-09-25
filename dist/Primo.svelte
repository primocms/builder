<script>
	import '@fontsource/fira-code/index.css'
	import { loadIcons, enableCache } from '@iconify/svelte'
	import { browser } from '$app/environment'
	import IconButton from './components/IconButton.svelte'
	import Toolbar from './views/editor/Toolbar.svelte'
	import Modal from './views/modal/ModalContainer.svelte'
	import modal from './stores/app/modal'
	import * as modals from './views/modal'
	import HSplitPane from './ui/HSplitPane.svelte'
	import Sidebar from './Sidebar.svelte'
	import { overrideItemIdKeyNameBeforeInitialisingDndZones } from 'svelte-dnd-action'
	overrideItemIdKeyNameBeforeInitialisingDndZones('_drag_id')

	import { userRole } from './stores/app'

	import { hydrate_active_data } from './stores/actions'

	/** @type {{
   * site: import('./').Site
   * pages: Array<import('./').Page>
   * symbols: Array<import('./').Symbol>
  }} */
	export let data

	export let role = 'DEV'

	$: $userRole = role

	hydrate_active_data(data)

	$: activeModal = getActiveModal($modal.type)
	function getActiveModal(modalType) {
		return modalType
			? {
					SITE_PAGES: modals.SitePages,
					COMPONENT_EDITOR: modals.ComponentEditor,
					SYMBOL_EDITOR: modals.SymbolEditor,
					PAGE_EDITOR: modals.PageEditor,
					SITE_EDITOR: modals.SiteEditor
			  }[modalType] || $modal.component
			: null
	}

	let showing_sidebar = true

	let leftPaneSize = browser ? (showing_sidebar ? window.innerWidth / 5 + `px` : '0px') : '200px'
	let rightPaneSize = browser
		? showing_sidebar
			? (window.innerWidth / 5) * 5 + 'px'
			: 'auto'
		: 'auto'

	$: if (parseInt(leftPaneSize) < 100) {
		leftPaneSize = '20px'
		rightPaneSize = '100%'
		showing_sidebar = false
	} else if (parseInt(leftPaneSize) >= 100 && !showing_sidebar) {
		reset()
	}

	function reset() {
		leftPaneSize = browser ? window.innerWidth / 5 + 'px' : '0px'
		rightPaneSize = browser ? (window.innerWidth / 5) * 5 + 'px' : '0px'
		showing_sidebar = true
	}

	// Preload icons
	loadIcons([
		'mdi:icon',
		'bxs:duplicate',
		'ic:baseline-edit',
		'ic:baseline-download',
		'ic:outline-delete',
		'bsx:error',
		'mdi:plus',
		'mdi:upload',
		'fa-solid:plus',
		'carbon:close',
		'material-symbols:drag-handle-rounded',
		'ph:caret-down-bold',
		'ph:caret-up-bold',
		'charm:layout-rows',
		'charm:layout-columns',
		'bx:refresh',
		'uil:image-upload',
		'mdi:arrow-up',
		'mdi:arrow-down',
		'ion:trash',
		'akar-icons:plus',
		'akar-icons:check',
		'mdi:chevron-down',
		'ic:round-code',
		'eos-icons:loading',
		'material-symbols:code',
		'fluent:form-multiple-24-regular'
	])
	enableCache('local')
</script>

<HSplitPane bind:leftPaneSize bind:rightPaneSize style="margin-top:54px">
	<div slot="left">
		{#if showing_sidebar}
			<Sidebar />
		{:else}
			<div class="expand primo-reset">
				<IconButton on:click={reset} icon="tabler:layout-sidebar-left-expand" />
			</div>
		{/if}
	</div>
	<div slot="right">
		<Toolbar>
			<slot name="toolbar"><!-- optional fallback --></slot>
		</Toolbar>
		<slot />
	</div>
</HSplitPane>

<Modal visible={!!activeModal}>
	<svelte:component this={activeModal} {...$modal.componentProps} />
</Modal>

<svelte:window on:resize={reset} />

<svelte:head>
	<link
		rel="stylesheet"
		href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css"
		integrity="sha512-1ycn6IcaQQ40/MKBW2W4Rhis/DbILU74C1vSrLJxCq57o941Ym01SwNsOMqvEBFlcgUa6xLiPY/NS5R+E6ztJQ=="
		crossorigin="anonymous"
		referrerpolicy="no-referrer"
	/>
</svelte:head>

<style>
	[slot='right'] {
		width: 100%;
	}
	[slot='left'] {
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		background: #121212;
		color: white;
	}
	.expand {
		height: 100%;
		display: flex;
	}
	:global(html) {
		--primo-color-brand: #35d994;
		--primo-color-brand-dark: #097548;
		--primo-color-white: white;
		--primo-color-codeblack: rgb(30, 30, 30);
		--primo-color-codeblack-opaque: rgba(30, 30, 30, 0.9);

		--primo-border-radius: 4px;

		--primo-color-black: rgb(17, 17, 17);
		--primo-color-black-opaque: rgba(17, 17, 17, 0.95);

		--color-gray-1: rgb(245, 245, 245);
		--color-gray-2: rgb(229, 229, 229);
		--color-gray-3: rgb(212, 212, 212);
		--color-gray-4: rgb(156, 163, 175);
		--color-gray-5: rgb(115, 115, 115);
		--color-gray-6: rgb(82, 82, 82);
		--color-gray-7: rgb(64, 64, 64);
		--color-gray-8: rgb(38, 38, 38);
		--color-gray-9: rgb(23, 23, 23);

		--font-size-1: 0.75rem;
		--font-size-2: 0.875rem;
		--font-size-3: 1.125rem;
		--font-size-4: 1.25rem;

		--input-background: #2a2b2d;
		--input-border: 1px solid #222;
		--input-border-radius: 4px;

		--label-font-size: 1rem;
		--label-font-weight: 700;

		--title-font-size: 0.875rem;
		--title-font-weight: 700;

		--button-color: #fafafa;
		--primo-button-background: #37383a;
		--button-hover-color: #7d8082;

		box-shadow: 0 0 #0000 0 0 #0000, 0 1px 2px 0 rgba(0, 0, 0, 0.05);
		--box-shadow-xl: 0 0 #0000, 0 0 #0000, 0 20px 25px -5px rgba(0, 0, 0, 0.1),
			0 10px 10px -5px rgba(0, 0, 0, 0.04);

		--transition-colors: background-color 0.1s, border-color 0.1s, color 0.1s, fill 0.1s,
			stroke 0.1s;

		--padding-container: 15px;
		--max-width-container: 1900px;

		--ring: 0px 0px 0px 2px var(--primo-color-brand);
		--primo-ring-primogreen: 0px 0px 0px 2px var(--primo-color-brand, #35d994);
		--primo-ring-primogreen-thin: 0px 0px 0px 1px var(--primo-color-brand, #35d994);
		--primo-ring-primogreen-thick: 0px 0px 0px 3px var(--primo-color-brand, #35d994);
	}</style>
