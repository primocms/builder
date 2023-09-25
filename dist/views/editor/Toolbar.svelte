<script>
	import { getContext } from 'svelte'
	import { find as _find } from 'lodash-es'
	import { browser } from '$app/environment'
	import ToolbarButton from './ToolbarButton.svelte'
	import LocaleSelector from './LocaleSelector.svelte'
	import { timeline } from '../../stores/data'
	import sections from '../../stores/data/sections'
	import { fields as site_fields } from '../../stores/data/site'
	import { undo_change, redo_change } from '../../stores/actions'
	import { PrimoButton } from '../../components/buttons'
	import site from '../../stores/data/site'
	import { userRole } from '../../stores/app'
	import {
		id as page_id,
		name as page_name,
		fields as page_fields
	} from '../../stores/app/activePage'
	import modal from '../../stores/app/modal'
	import { click_to_copy } from '../../utilities'

	const page_field_button = {
		id: 'toolbar--page',
		title: 'Page',
		label: 'Page',
		svg: '<svg width="10" height="16" viewBox="0 0 12 16" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="0.425" y="0.925" width="10.4834" height="14.15" rx="1.575" fill="#121212"/><rect x="2.41675" y="3.625" width="2" height="2" fill="#D9D9D9"/><rect x="2.41675" y="7.125" width="6" height="0.75" fill="#D9D9D9"/><rect x="2.41675" y="9.375" width="5" height="0.75" fill="#D9D9D9"/><rect x="2.41675" y="11.625" width="6.5" height="0.75" fill="#D9D9D9"/><rect x="0.425" y="0.925" width="10.4834" height="14.15" rx="1.575" stroke="#CECECE" stroke-width="0.85"/></svg>',
		onclick: () => modal.show('PAGE_EDITOR', {}, { showSwitch: true, disabledBgClose: true })
	}

	const site_field_button = {
		id: 'toolbar--site',
		svg: `<svg width="12" height="18" viewBox="0 0 15 18" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3.50831" y="0.925" width="10.4834" height="13.3167" rx="1.575" fill="#121212"/><rect x="3.50831" y="0.925" width="10.4834" height="13.3167" rx="1.575" stroke="#CECECE" stroke-width="0.85"/><rect x="2.09169" y="2.34199" width="10.4834" height="13.3167" rx="1.575" fill="#121212"/><rect x="2.09169" y="2.34199" width="10.4834" height="13.3167" rx="1.575" stroke="#CECECE" stroke-width="0.85"/><rect x="0.675" y="3.75801" width="10.4834" height="13.3167" rx="1.575" fill="#121212"/><rect x="2.66669" y="6.4165" width="2" height="2" fill="#D9D9D9"/><rect x="2.66669" y="9.6665" width="5.75" height="0.75" fill="#D9D9D9"/><rect x="2.66669" y="11.6665" width="5" height="0.75" fill="#D9D9D9"/><rect x="2.66669" y="13.6665" width="6.5" height="0.75" fill="#D9D9D9"/><rect x="0.675" y="3.75801" width="10.4834" height="13.3167" rx="1.575" stroke="#CECECE" stroke-width="0.85"/></svg>`,
		title: 'Site',
		label: 'Site',
		onclick: () => modal.show('SITE_EDITOR', {}, { showSwitch: true, disabledBgClose: true })
	}

	$: show_page_fields = $userRole === 'DEV' || $page_fields.length > 0
	$: show_site_fields = $userRole === 'DEV' || $site_fields.length > 0

	let field_buttons = []

	// for content editors, only show page/site field buttons if fields exist
	$: if (show_page_fields && show_site_fields) {
		field_buttons = [page_field_button, site_field_button]
	} else if (show_page_fields) {
		field_buttons = [page_field_button]
	} else if (show_site_fields) {
		field_buttons = [site_field_button]
	}

	$: buttons = [
		{
			id: 'toolbar--pages',
			title: 'Pages',
			svg: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="M10 19q-.425 0-.713-.288T9 18q0-.425.288-.713T10 17h10q.425 0 .713.288T21 18q0 .425-.288.713T20 19H10Zm0-6q-.425 0-.713-.288T9 12q0-.425.288-.713T10 11h10q.425 0 .713.288T21 12q0 .425-.288.713T20 13H10Zm0-6q-.425 0-.713-.288T9 6q0-.425.288-.713T10 5h10q.425 0 .713.288T21 6q0 .425-.288.713T20 7H10ZM5 20q-.825 0-1.413-.588T3 18q0-.825.588-1.413T5 16q.825 0 1.413.588T7 18q0 .825-.588 1.413T5 20Zm0-6q-.825 0-1.413-.588T3 12q0-.825.588-1.413T5 10q.825 0 1.413.588T7 12q0 .825-.588 1.413T5 14Zm0-6q-.825 0-1.413-.588T3 6q0-.825.588-1.413T5 4q.825 0 1.413.588T7 6q0 .825-.588 1.413T5 8Z"/></svg>',
			onclick: () =>
				modal.show(
					'SITE_PAGES',
					{},
					{ hideLocaleSelector: true, maxWidth: '600px', showSwitch: false }
				)
		},
		field_buttons
	]
	$: pageEmpty =
		$sections && $sections.length <= 1 && $sections.length > 0 && $sections[0]['type'] === 'options'

	let DEBUGGING
	if (browser) DEBUGGING = getContext('DEBUGGING')
</script>

<nav aria-label="toolbar" id="primo-toolbar" class="primo-reset">
	<div class="menu-container">
		<div class="left">
			<PrimoButton on:signOut />
			<div class="buttons">
				{#each buttons as button}
					{#if Array.isArray(button)}
						{@const group = button}
						<div class="button-group">
							{#each group as button}
								<ToolbarButton {...button} />
							{/each}
						</div>
					{:else}
						<div class="icon-button">
							<ToolbarButton {...button} />
						</div>
					{/if}
				{/each}
			</div>
		</div>
		<div class="site-name">
			<span class="site">{$site.name} /</span>
			{#if DEBUGGING}
				<span class="page">
					{$page_name}
					<button use:click_to_copy>({$page_id})</button>
				</span>
			{:else}
				<span class="page">{$page_name}</span>
			{/if}
		</div>
		<div class="right">
			{#if !$timeline.first}
				<ToolbarButton id="undo" title="Undo" icon="material-symbols:undo" on:click={undo_change} />
			{/if}
			{#if !$timeline.last}
				<ToolbarButton id="redo" title="Redo" icon="material-symbols:redo" on:click={redo_change} />
			{/if}
			<slot />
			<LocaleSelector />
			<ToolbarButton
				type="primo"
				label="Deploy"
				active={false}
				on:click={() => modal.show('DEPLOY', {}, { maxWidth: '450px', hideLocaleSelector: true })}
				disabled={pageEmpty}
			/>
		</div>
	</div>
</nav>

<style>
	#primo-toolbar {
		position: fixed;
		left: 0;
		right: 0;
		top: 0;
		z-index: 99999999;
		border-bottom: 1px solid var(--color-gray-8);
	}

	.left {
		/* width: 100%; */
		display: flex;
		justify-content: flex-start;
		gap: 1rem;
	}

	.buttons {
		display: flex;
		margin-left: 0.25rem;
	}

	.left .button-group {
		display: flex;
		flex-direction: row;
	}

	.site-name {
		font-size: 14px;
	}

	.site-name .site {
			color: #b6b6b6;
		}

	.site-name .page {
			color: white;
		}

	@media (max-width: 670px) {

	.site-name {
			display: none
	}
		}

	.menu-container {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin: 0 auto;
		padding: 0.5rem 1rem;
	}

	.menu-container:after {
		background: #121212;
		content: '';
		z-index: -1;
		height: 100%;
		width: 100%;
		position: absolute;
		top: 0;
		left: 0;
		-webkit-backdrop-filter: blur(10px);
		        backdrop-filter: blur(10px);
	}

	.right {
		display: flex;
		align-items: center;
		/* gap: 1rem; */
	}

	.button-group {
		display: flex;
		flex-direction: row;
		justify-content: flex-end;
	}</style>
