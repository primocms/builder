<script>
	import _ from 'lodash-es'
	import { tick } from 'svelte'
	import { fade } from 'svelte/transition'
	import { flip } from 'svelte/animate'
	import ComponentNode from './Layout/ComponentNode.svelte'
	import BlockToolbar from './Layout/BlockToolbar.svelte'
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
	set_page_content(page)
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
		if (!head.error) {
			append_to_head(head.head)
		} else {
			console.warn(head.error)
		}
		// html_below = !below.error ? below.html : ''
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

	let draggable_sections = $sections.map((s) => ({ ...s, _drag_id: s.id }))
	$: refresh_sections($sections)
	async function refresh_sections(_) {
		draggable_sections = $sections.map((s) => ({ ...s, _drag_id: s.id }))
	}

	const flipDurationMs = 100

	let dragged_symbol = null
	function consider_dnd({ detail }) {
		dragged_symbol = detail.items
			.map((item, index) => ({ ...item, index }))
			.find((item) => item.isDndShadowItem)

		console.log({ detail, dragged_symbol })

		if (!dragged_symbol) return

		const is_site_symbol = $symbols.some((s) => s.id === dragged_symbol.id)
		if (is_site_symbol) {
			console.log('Site symbol')
			draggable_sections = detail.items
		} else {
			console.log('Primo symbol')
			dragged_symbol.is_primo_block = true
			draggable_sections = detail.items.map((item) => {
				if (item[SHADOW_ITEM_MARKER_PROPERTY_NAME]) {
					// currently dragged item
					console.log('adding primo symbol', item)
					return { ...item, primo_symbol: item }
				} else return item
			})
		}
	}

	async function finalize_dnd() {
		moving = true
		if (dragged_symbol.is_primo_block) {
			active_page.add_primo_block(dragged_symbol, dragged_symbol.index)
		} else {
			active_page.add_block(dragged_symbol, dragged_symbol.index)
		}
		refresh_sections()
		setTimeout(() => {
			moving = false
		}, 300)
	}

	let hovered_block = null

	let block_toolbar_element
	let page_el
	let hovered_block_el

	let showing_block_toolbar = false
	async function show_block_toolbar() {
		showing_block_toolbar = true
		await tick()
		position_block_toolbar()
		page_el.addEventListener('scroll', () => {
			showing_block_toolbar = false
		})
	}

	function position_block_toolbar() {
		if (!hovered_block_el) return
		hovered_block_el.appendChild(block_toolbar_element)
		const { top, left, bottom, right } = hovered_block_el.getBoundingClientRect()
		const block_positions = {
			top: (top <= 56 ? 56 : top) + window.scrollY,
			bottom: bottom >= window.innerHeight ? 0 : window.innerHeight - bottom,
			left,
			right: window.innerWidth - right - window.scrollX
		}
		block_toolbar_element.style.top = `${block_positions.top}px`
		block_toolbar_element.style.bottom = `${block_positions.bottom}px`
		block_toolbar_element.style.left = `${block_positions.left}px`
		block_toolbar_element.style.right = `${block_positions.right}px`
	}

	function hide_block_toolbar() {
		showing_block_toolbar = false
	}

	function edit_component(block, showIDE = false) {
		lock_block(block.id)
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

	let moving = false // workaround to prevent block toolbar from showing when moving blocks

	// using instead of <svelte:head> to enable script tags
	function append_to_head(code) {
		// Create a temporary container to hold the parsed HTML
		const tempContainer = document.createElement('div')
		tempContainer.innerHTML = code

		// Iterate through the child nodes, and append them to the head
		Array.from(tempContainer.childNodes).forEach((child) => {
			if (child.tagName === 'SCRIPT') {
				// Handle script tags manually to ensure they are executed
				const script = document.createElement('script')
				script.textContent = child.textContent
				// Copy over all attributes from the original script tag, including 'src'
				Array.from(child.attributes).forEach((attr) => {
					script.setAttribute(attr.name, attr.value)
				})
				document.head.appendChild(script)
			} else {
				// Append other elements directly
				document.head.appendChild(child)
			}
		})
	}
</script>

<!-- Loading Spinner -->
{#if !page_mounted && $sections.length > 0}
	<div class="spinner-container" out:fade={{ duration: 200 }}>
		<Spinner />
	</div>
{/if}

<!-- Block Buttons -->
{#if showing_block_toolbar}
	<BlockToolbar
		bind:node={block_toolbar_element}
		id={hovered_block.id}
		i={hovered_block.index}
		on:delete={async () => {
			active_page.delete_block(hovered_block.id)
			refresh_sections()
		}}
		on:duplicate={() => {
			active_page.duplicate_block(hovered_block.id)
			refresh_sections()
		}}
		on:edit-code={() => edit_component(hovered_block, true)}
		on:edit-content={() => edit_component(hovered_block)}
		on:moveUp={async () => {
			moving = true
			hide_block_toolbar()
			active_page.move_block(hovered_block, hovered_block.index - 1)
			refresh_sections()
			setTimeout(() => {
				moving = false
			}, 300)
		}}
		on:moveDown={async () => {
			moving = true
			hide_block_toolbar()
			active_page.move_block(hovered_block, hovered_block.index + 1)
			refresh_sections()
			setTimeout(() => {
				moving = false
			}, 300)
		}}
	/>
{/if}

<!-- Page Blocks -->
<div
	id="page"
	bind:this={page_el}
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
	{#each draggable_sections as block (block.id)}
		<!-- svelte-ignore a11y-no-static-element-interactions -->
		<!-- svelte-ignore a11y-mouse-events-have-key-events -->
		{@const locked = $locked_blocks.includes(block.id)}
		<div
			in:fade={{ duration: 100 }}
			class="section"
			id="section-{block.id.split('-')[0]}"
			class:locked
			data-block={block.symbol}
			on:mousemove={() => {
				if (!moving && !showing_block_toolbar) {
					show_block_toolbar()
				}
			}}
			on:mouseenter={async ({ target }) => {
				hovered_block = block
				hovered_block_el = target
				if (!moving) {
					show_block_toolbar()
				}
			}}
			on:mouseleave={hide_block_toolbar}
			animate:flip={{ duration: flipDurationMs }}
			style="min-height: 3rem;overflow:hidden;position: relative;"
		>
			{#if block[SHADOW_ITEM_MARKER_PROPERTY_NAME]}
				<div class="block-placeholder">
					<ComponentNode
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
					{block}
					on:lock={() => lock_block(block.id)}
					on:unlock={() => unlock_block(block.id)}
					on:mount={() => sections_mounted++}
					on:resize={() => {
						if (showing_block_toolbar) {
							position_block_toolbar()
						}
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
		position: absolute;
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
