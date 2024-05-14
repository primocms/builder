<script>
	import { tick } from 'svelte'
	import _ from 'lodash-es'
	import fileSaver from 'file-saver'
	import axios from 'axios'
	import { userRole } from '../../stores/app/misc.js'
	import modal from '../../stores/app/modal.js'
	import site from '../../stores/data/site.js'
	import symbols from '../../stores/data/symbols.js'
	import UI from '../../ui/index.js'
	import Icon from '@iconify/svelte'
	import { site_design_css } from '../../code_generators.js'
	import { Symbol } from '../../factories.js'
	import Sidebar_Symbol from './Sidebar_Symbol.svelte'
	import Content from '../Content.svelte'
	import { symbols as symbol_actions } from '../../stores/actions.js'
	import { v4 as uuidv4 } from 'uuid'
	import { validate_symbol } from '../../converter.js'
	import { dndzone } from 'svelte-dnd-action'
	import { flip } from 'svelte/animate'

	export let page
	let active_tab = 'BLOCKS'

	async function create_symbol() {
		const symbol = Symbol({ site: $site.id })
		symbol_actions.create(symbol)
		refresh_symbols()
	}

	async function show_block_picker() {
		const primo_blocks = await get_primo_blocks()
		modal.show(
			'BLOCK_PICKER',
			{
				blocks: primo_blocks,
				site: $site,
				append: site_design_css($site.design),
				onsave: async (selected) => {
					modal.hide()
					await Promise.all(selected.map(async (symbol) => symbol_actions.create(symbol)))
					// refresh_symbols()
				}
			},
			{
				hideLocaleSelector: true
			}
		)
	}

	async function rename_symbol(id, name) {
		symbol_actions.update(id, { name })
		refresh_symbols()
	}

	async function delete_symbol(symbol_id) {
		const symbol = $symbols.find((s) => s.id === symbol_id)
		symbol_actions.delete(symbol)
		refresh_symbols()
	}

	async function duplicate_symbol(symbol_id, index) {
		const symbol = $symbols.find((s) => s.id === symbol_id)
		const new_symbol = _.cloneDeep(symbol)
		new_symbol.id = uuidv4()
		delete new_symbol.created_at
		new_symbol.name = `${new_symbol.name} (copy)`
		symbol_actions.create(
			{
				...new_symbol,
				site: $site.id
			},
			index
		)
		refresh_symbols()
	}

	async function upload_symbol({ target }) {
		var reader = new window.FileReader()
		reader.onload = async function ({ target }) {
			if (typeof target.result !== 'string') return
			try {
				const uploaded = JSON.parse(target.result)
				const validated = validate_symbol(uploaded)
				symbol_actions.create({
					...validated,
					id: uuidv4(),
					site: $site.id
				})
				refresh_symbols()
			} catch (error) {
				console.error(error)
			}
		}
		reader.readAsText(target.files[0])
	}

	async function download_symbol(symbol_id) {
		const symbol = $symbols.find((s) => s.id === symbol_id)
		const json = JSON.stringify(symbol)
		var blob = new Blob([json], { type: 'application/json' })
		fileSaver.saveAs(blob, `${symbol.name || symbol.id}.json`)
	}

	async function get_primo_blocks() {
		const { data } = await axios.get(
			'https://raw.githubusercontent.com/mateomorris/primo-library/main/primo.json'
		)
		return data.symbols.map((s) => ({ ...s, _drag_id: uuidv4() }))
	}

	let draggable_symbols = []
	$: refresh_symbols($symbols)

	const flipDurationMs = 200

	function consider_dnd({ detail }) {
		draggable_symbols = detail.items
	}

	async function finalize_dnd({ detail }) {
		if (detail.info.trigger === 'droppedIntoZone') {
			await symbol_actions.rearrange(detail.items)
		}
		dragging = null
		refresh_symbols()
	}

	async function refresh_symbols() {
		await tick()
		draggable_symbols = $symbols
			.filter((s) => s.page_type === page.page_type.id) // only show symbols belonging to this page type
			.map((s) => ({ ...s, _drag_id: s.id }))
			.sort((a, b) => a.index - b.index)
	}

	let dragging = null

	// TODO: add this to GenericFields, pass in fields and content
	// let fields = page.fields
	let fields = []
	$: console.log({ page, fields })
	$: setupComponent('en') // swap content out of on-screen fields
	function setupComponent(loc) {
		fields = getFieldValues(fields, loc)
	}

	// hydrate fields with content (placeholder if passed component is a Symbol)
	function getFieldValues(fields, loc) {
		return fields.map((field) => {
			const field_value = page.content[loc]?.[field.key]
			// const value = field_value !== undefined ? field_value : getCachedPlaceholder(field)
			return {
				...field,
				value: field_value
			}
		})
	}
</script>

<div class="sidebar primo-reset">
	<UI.Tabs
		variant="secondary"
		tabs={[
			{
				id: 'BLOCKS',
				icon: 'lucide:blocks',
				label: `Blocks`
			},
			{
				id: 'PAGE_OPTIONS',
				icon: 'material-symbols:article-outline',
				label: `Options`
			}
		]}
		bind:active_tab_id={active_tab}
		disable_hotkeys={true}
	/>
	<div class="container">
		{#if active_tab === 'BLOCKS'}
			{#if $symbols.length > 0}
				<!-- TODO: add 'edit blocks' link button -->
				<!-- <div class="primo-buttons">
					<button class="primo-button" on:click={show_block_picker}>
						<Icon icon="mdi:plus" />
						<span>Add</span>
					</button>
					{#if $userRole === 'DEV'}
						<button class="primo-button" on:click={create_symbol}>
							<Icon icon="mdi:code" />
							<span>Create</span>
						</button>
					{/if}
					<label class="primo-button">
						<input on:change={upload_symbol} type="file" accept=".json" />
						<Icon icon="mdi:upload" />
						<span>Upload</span>
					</label>
				</div> -->
				<!-- svelte-ignore missing-declaration -->
				<!-- svelte-ignore a11y-no-static-element-interactions -->
				<div
					class="symbols"
					use:dndzone={{
						items: draggable_symbols,
						flipDurationMs,
						dropTargetStyle: '',
						centreDraggedOnCursor: true,
						morphDisabled: true,
						dragDisabled: !dragging
					}}
					on:consider={consider_dnd}
					on:finalize={finalize_dnd}
				>
					{#each draggable_symbols as symbol, i (symbol._drag_id)}
						<div animate:flip={{ duration: flipDurationMs }}>
							<Sidebar_Symbol
								{symbol}
								head={$site.code.head + page.page_type.code.head}
								append={site_design_css($site.design)}
								header_hidden={dragging === symbol._drag_id}
								on:mousedown={() => (dragging = symbol._drag_id)}
								on:mouseup={() => (dragging = null)}
								on:rename={({ detail: name }) => rename_symbol(symbol.id, name)}
								on:download={() => download_symbol(symbol.id)}
								on:delete={() => delete_symbol(symbol.id)}
								on:duplicate={() => duplicate_symbol(symbol.id, i + 1)}
							/>
						</div>
					{/each}
				</div>
			{:else}
				<div class="empty">
					<p>You don't have any Blocks in your site yet</p>
					<p>Create a Block from scratch, upload an existing Block, or use the Primo Blocks.</p>
				</div>
				<div class="primo-buttons">
					<button class="primo-button" on:click={show_block_picker}>
						<Icon icon="mdi:plus" />
						<span>Add</span>
					</button>
					<button class="primo-button" on:click={create_symbol}>
						<Icon icon="mdi:code" />
						<span>Create</span>
					</button>
					<label class="primo-button">
						<input on:change={upload_symbol} type="file" accept=".json" />
						<Icon icon="mdi:upload" />
						<span>Upload</span>
					</label>
				</div>
			{/if}
		{:else}
			<div class="page-type-fields">
				<Content
					fields={page.page_type.fields}
					content={page.content}
					on:input={({ detail: updated_content }) => {
						console.log({ updated_content })
					}}
					on:transaction={({ detail }) => {
						console.log({ detail })
					}}
					minimal={true}
				/>
			</div>
		{/if}
	</div>
</div>

<style lang="postcss">
	.sidebar {
		width: 100%;
		background: #171717;
		z-index: 9;
		display: flex;
		flex-direction: column;
		height: calc(100vh - 54px);
		/* gap: 0.5rem; */
		z-index: 9;
		position: relative;
		overflow: hidden;
		padding-top: 0.5rem;
	}

	.empty {
		padding-inline: 1.5rem;

		p {
			font-weight: 400;
			color: var(--color-gray-3);
			font-size: 0.875rem;
			padding-bottom: 0.25rem;
		}
	}

	.primo-buttons {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;

		.primo-button {
			padding: 0.25rem 0.5rem;
			color: #b6b6b6;
			background: #292929;
			border-radius: 4px;
			cursor: pointer;
			display: flex;
			gap: 0.25rem;
			align-items: center;
			font-size: 0.75rem;

			input {
				display: none;
			}
		}
	}

	.container {
		display: flex;
		flex-direction: column;
		overflow-y: auto;
		padding: 1rem;
		padding-top: 0.5rem;
	}

	.symbols {
		gap: 1rem;
		flex: 1;
		display: flex;
		flex-direction: column;
	}
</style>
