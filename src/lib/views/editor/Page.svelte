<script>
	import _ from 'lodash-es'
	import { v4 as uuidv4 } from 'uuid'
	import { tick } from 'svelte'
	import { fade } from 'svelte/transition'
	import { flip } from 'svelte/animate'
	import ComponentNode from './Layout/ComponentNode.svelte'
	import BlockButtons from './Layout/BlockButtons.svelte'
	import LockedOverlay from './Layout/LockedOverlay.svelte'
	import { dndzone, SHADOW_ITEM_MARKER_PROPERTY_NAME } from 'svelte-dnd-action'
	import { afterNavigate } from '$app/navigation'
	import { isEqual, cloneDeep } from 'lodash-es'
	import Spinner from '../../ui/misc/Spinner.svelte'
	import { code as siteCode } from '../../stores/data/site'
	import { locale, locked_blocks, showingIDE } from '../../stores/app/misc'
	import { active_page } from '../../stores/actions'
	import modal from '../../stores/app/modal'
	import {
		id as pageID,
		name as pageName,
		url as pageURL,
		fields as pageFields,
		code as pageCode,
		content as pageContent
	} from '../../stores/app/activePage'
	import sections from '../../stores/data/sections'
	import symbols from '../../stores/data/symbols'
	import { processCode, processCSS, wrapInStyleTags } from '../../utils'
	import { getPageData } from '../../stores/helpers'
	import { realtimeChanged } from '$lib/database'

	export let page

	let html_head = ''
	let html_below = ''

	$: set_page_content(page)
	async function set_page_content(page_data) {
		// if (!page_data) return
		// await tick()
		$sections = page_data.sections

		$pageID = page_data.id
		$pageName = page_data.name
		$pageURL = page_data.url
		$pageFields = page_data.fields
		$pageCode = page_data.code
		$pageContent = page_data.content
	}

	const cached = { pageCode: null, siteCode: null }
	let latest_run
	$: set_page_html($pageCode, $siteCode)
	async function set_page_html(pageCode, siteCode) {
		if (isEqual(pageCode, cached.pageCode) && isEqual(siteCode, cached.siteCode)) return

		const this_run = Date.now()

		cached.pageCode = cloneDeep(pageCode)
		cached.siteCode = cloneDeep(siteCode)
		const css = await processCSS(siteCode.css + pageCode.css)

		// workaround to prevent older css from overwriting newer css
		if (latest_run > this_run) return
		latest_run = this_run

		const data = getPageData({})
		const [head, below] = await Promise.all([
			processCode({
				component: {
					html: `<svelte:head>
            ${siteCode.html.head}${pageCode.html.head}
            ${wrapInStyleTags(css)}
          </svelte:head>`,
					css: '',
					js: '',
					data
				}
			}),
			processCode({
				component: {
					html: siteCode.html.below + pageCode.html.below,
					css: '',
					js: '',
					data
				}
			})
		])
		html_head = !head.error ? head.head : ''
		html_below = !below.error ? below.html : ''
	}

	// Fade in page when all components mounted
	let page_mounted = false
	$: page_is_empty = $sections.length === 0

	// detect when all sections are mounted
	let sections_mounted = 0
	$: if (sections_mounted === $sections.length && sections_mounted !== 0) {
		page_mounted = true
	}

	afterNavigate(() => {
		page_mounted = false
		sections_mounted = 0
	})

	async function lock_block(block_id) {
		realtimeChanged({
			active_block: block_id
		})
	}

	function unlock_block() {
		// workaround to prevent issue when unlocking immediately before locking when switching from one block to another
		setTimeout(() => {
			realtimeChanged({
				active_block: null
			})
		}, 100)
	}

	$: draggable_sections = $sections.map((s) => ({ ...s, _drag_id: s.id }))

	const flipDurationMs = 100

	let dragged_symbol = null
	function consider_dnd({ detail }) {
		dragged_symbol = detail.items
			.map((item, index) => ({ ...item, index }))
			.find((item) => item._drag_id === detail.info.id)

		if ($symbols.find((symbol) => symbol.id === dragged_symbol.id)) {
			draggable_sections = detail.items
		} else {
			dragged_symbol.is_primo_block = true
			draggable_sections = detail.items.map((item) =>
				item._drag_id === detail.info.id ? { ...item, primo_symbol: item } : item
			)
		}
	}

	function finalize_dnd({ detail }) {
		if (dragged_symbol.is_primo_block) {
			active_page.add_primo_block(dragged_symbol, dragged_symbol.index)
		} else {
			active_page.add_block(dragged_symbol, dragged_symbol.index)
		}
	}

	let hovered_block = null

	let buttons_el
	let hovered_block_el
	$: position_block_buttons(hovered_block_el, buttons_el)
	function position_block_buttons(hovered_block_el, buttons_el) {
		if (!hovered_block_el || !buttons_el) return
		hovered_block_el.appendChild(buttons_el)
	}

	function edit_component(block, showIDE = false) {
		lock_block(block.id)
		locked_blocks.update((blocks) => [...blocks, block.id])
		$showingIDE = showIDE
		modal.show(
			'COMPONENT_EDITOR',
			{
				component: block,
				header: {
					title: `Edit Block`,
					icon: $showingIDE ? 'fas fa-code' : 'fas fa-edit',
					onclose: () => {
						unlock_block(block.id)
					},
					button: {
						icon: 'fas fa-check',
						label: 'Save',
						onclick: async () => {
							unlock_block(block.id)
							modal.hide()
						}
					}
				}
			},
			{
				showSwitch: true,
				disabledBgClose: true
			}
		)
	}
</script>

<!-- Loading Spinner -->
{#if !page_mounted && $sections.length > 0}
	<div class="spinner-container" out:fade={{ duration: 200 }}>
		<Spinner />
	</div>
{/if}

<!-- Block Buttons -->
{#if hovered_block_el}
	<BlockButtons
		bind:node={buttons_el}
		i={hovered_block.index}
		on:delete={() => active_page.delete_block(hovered_block)}
		on:duplicate={() => active_page.duplicate_block(hovered_block)}
		on:edit-code={() => edit_component(hovered_block, true)}
		on:edit-content={() => edit_component(hovered_block)}
		on:moveUp={() => active_page.move_block(hovered_block, hovered_block.index - 1)}
		on:moveDown={() => active_page.move_block(hovered_block, hovered_block.index + 1)}
	/>
{/if}

<!-- Page & Site HTML/CSS -->
<svelte:head>
	{@html html_head}
</svelte:head>

<!-- Page Blocks -->
<div
	id="page"
	class:fadein={page_mounted}
	lang={$locale}
	use:dndzone={{
		items: draggable_sections,
		flipDurationMs,
		morphDisabled: true,
		dragDisabled: true
	}}
	on:consider={consider_dnd}
	on:finalize={finalize_dnd}
>
	{#each draggable_sections.sort((a, b) => a.index - b.index) as block, i (block.id)}
		<!-- svelte-ignore a11y-no-static-element-interactions -->
		<!-- svelte-ignore a11y-mouse-events-have-key-events -->
		{@const locked = $locked_blocks.includes(block.id)}
		<div
			in:fade={{ duration: 100 }}
			class="section"
			id="section-{block.id.split('-')[0]}"
			class:locked
			data-block={block.symbol}
			on:mouseenter={({ target }) => {
				hovered_block = block
				hovered_block_el = target
			}}
			on:mouseleave={() => {
				hovered_block = null
				hovered_block_el = null
			}}
			animate:flip={{ duration: flipDurationMs }}
			style="min-height: 5rem;position:relative;overflow:hidden;"
		>
			{#if block[SHADOW_ITEM_MARKER_PROPERTY_NAME]}
				<div class="block-placeholder">
					<ComponentNode
						{i}
						primo_symbol={block.primo_symbol}
						block={{
							...block,
							symbol: block.id
						}}
					/>
				</div>
			{:else}
				{#if locked}
					<LockedOverlay {locked} />
				{/if}
				<ComponentNode
					{i}
					{block}
					on:lock={() => lock_block(block.id)}
					on:unlock={() => unlock_block(block.id)}
					on:mount={() => {
						sections_mounted++
					}}
				/>
			{/if}
		</div>
	{/each}
</div>
{@html html_below || ''}

<!-- Empty State -->
{#if page_is_empty}
	<div class="empty-state">This is an empty page</div>
{/if}

<style lang="postcss">
	.spinner-container {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 5;
		pointer-events: none;

		--Spinner-color: var(--primo-color-brand);
		--Spinner-color-opaque: rgba(248, 68, 73, 0.2);
	}
	#page {
		transition: 0.2s opacity;
		opacity: 0;
		border-top: 0;
		height: calc(100vh - 54px);
		overflow: auto;
	}
	#page.fadein {
		opacity: 1;
	}
	.empty-state {
		position: absolute;
		inset: 0;
		display: flex;
		justify-content: center;
		align-items: center;
		color: var(--color-gray-4);
		pointer-events: none;
		z-index: -2;
		font-family: Inter, sans-serif;
		color: #999;
		z-index: 1;
		text-align: center;
	}
	.block-placeholder {
		position: absolute;
		inset: 0;
		visibility: visible;
		margin: 0;
		display: flex;
		align-items: center;
		box-shadow: inset 0 0 0 calc(4px) var(--color-gray-8);

		:global(.node) {
			position: absolute;
		}

		&::after {
			content: '';
			position: absolute;
			inset: 0;
			background: rgba(0, 0, 0, 0.75);
			z-index: 99;
		}
	}
</style>
