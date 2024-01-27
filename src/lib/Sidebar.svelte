<script>
	import { tick } from 'svelte'
	import _ from 'lodash-es'
	import fileSaver from 'file-saver'
	import axios from 'axios'
	import { userRole } from './stores/app/misc'
	import site from './stores/data/site'
	import symbols from './stores/data/symbols'
	import Icon from '@iconify/svelte'
	import { Symbol } from './const'
	import Sidebar_Symbol from './Sidebar_Symbol.svelte'
	import { symbols as symbol_actions, active_page } from './stores/actions'
	import { v4 as uuidv4 } from 'uuid'
	import { validate_symbol } from '$lib/converter'
	import { dndzone } from 'svelte-dnd-action'
	import { flip } from 'svelte/animate'

	let active_tab = 'site'

	async function create_symbol() {
		const symbol = Symbol({ site: $site.id })
		symbol_actions.create(symbol)
		refresh_symbols()
	}

	async function rename_symbol(id, name) {
		symbol_actions.update(id, { name })
		refresh_symbols()
	}

	/**
	 * @param {string} symbol_id
	 */
	async function delete_symbol(symbol_id) {
		const symbol = $symbols.find((s) => s.id === symbol_id)
		symbol_actions.delete(symbol)
		refresh_symbols()
	}

	/**
	 * @param {string} symbol_id
	 * @param {number} index - The index at which the new symbol should be inserted.
	 */
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

	/**
	 * @param {string} symbol_id - The id of the symbol to be downloaded.
	 */
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

	let draggable_symbols = $symbols.map((s) => ({ ...s, _drag_id: s.id }))
	$: refresh_symbols($symbols)

	const flipDurationMs = 200

	function consider_dnd({ detail }) {
		draggable_symbols = detail.items
	}

	async function finalize_dnd({ detail }) {
		if (detail.info.trigger === 'droppedIntoZone') {
			const rearranged = detail.items.map((item, index) => ({ ...item, index }))
			await symbol_actions.rearrange(rearranged)
		}
		refresh_symbols()
		dragging = null
	}

	async function refresh_symbols() {
		await tick()
		draggable_symbols = $symbols.map((s, i) => ({ ...s, _drag_id: s.id }))
	}

	let dragging = null
</script>

<div class="sidebar primo-reset">
	<div class="tabs">
		<button on:click={() => (active_tab = 'site')} class:active={active_tab === 'site'}>
			Site Blocks
		</button>
		<button on:click={() => (active_tab = 'primo')} class:active={active_tab === 'primo'}>
			Primo Blocks
		</button>
	</div>
	{#if active_tab === 'site'}
		{#if $symbols.length > 0}
			<div class="primo-buttons">
				{#if $userRole === 'DEV'}
					<button class="primo-button" on:click={create_symbol}>
						<Icon icon="mdi:plus" />
						<span>Create</span>
					</button>
				{/if}
				<label class="primo-button">
					<input on:change={upload_symbol} type="file" accept=".json" />
					<Icon icon="mdi:upload" />
					<span>Upload</span>
				</label>
			</div>
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
				<button class="primo-button" on:click={create_symbol}>
					<Icon icon="mdi:plus" />
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
		{#await get_primo_blocks() then primo_blocks}
			<div
				class="symbols"
				use:dndzone={{
					items: primo_blocks,
					flipDurationMs,
					dropTargetStyle: '',
					centreDraggedOnCursor: true,
					morphDisabled: true
				}}
				on:consider={consider_dnd}
				on:finalize={finalize_dnd}
			>
				{#each primo_blocks as symbol, i}
					<Sidebar_Symbol
						{symbol}
						controls_enabled={false}
						header_hidden={dragging === symbol._drag_id}
					/>
				{/each}
			</div>
		{/await}
	{/if}
</div>

<style lang="postcss">
	.sidebar {
		width: 100%;
		background: #171717;
		z-index: 9;
		display: flex;
		flex-direction: column;
		height: calc(100vh - 54px);
		gap: 1rem;
		z-index: 9;
		position: relative;
		overflow: hidden;
	}

	.tabs {
		background: #171717;
		border-bottom: 1px solid #292929;
		padding-top: 1rem;
		padding-inline: 1.5rem;
		display: flex;
		gap: 1rem;
		position: sticky;
		top: 0;
		z-index: 1;

		button {
			color: #71788e;
			font-weight: 400;
			font-size: 14px;
			white-space: nowrap;
			border-bottom: 3px solid transparent;
			padding: 0.5rem 0;
			transition: 0.1s;

			&.active {
				color: #dadada;
				border-bottom: 2px solid var(--primo-color-brand);
			}
		}
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
		gap: 0.5rem;
		padding-inline: 1.5rem;

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

	.symbols {
		padding-inline: 1.5rem;
		gap: 1rem;
		flex: 1;
		display: flex;
		flex-direction: column;
		padding-bottom: 1.5rem;
		overflow-y: scroll;
	}
</style>
