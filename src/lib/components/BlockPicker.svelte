<script>
	import Icon from '@iconify/svelte'
	import Symbol from '../components/Site_Symbol.svelte'
	import { v4 as uuid } from 'uuid'
	import { Symbol as Create_Symbol } from '../factories'

	export let blocks
	export let site
	export let selected = []
	export let append = ''

	function include_symbol(symbol) {
		if (selected.some((s) => s.id === symbol.id) || checked.includes(symbol.id)) {
			selected = selected.filter((item) => item.id !== symbol.id)
			checked = checked.filter((item) => item !== symbol.id)
		} else {
			selected = [
				...selected,
				Create_Symbol({
					...symbol,
					site: site.id,
					id: uuid()
				})
			]
			checked = [...checked, symbol.id]
		}
	}

	let selected_group = null
	const symbol_groups = [
		'Hero',
		'Routing',
		'Call to Action',
		'Form',
		'Logo Cloud',
		'Editorial Content',
		'Accordion',
		'Statistic',
		'Header',
		'Footer',
		'Gallery'
	]
	// $: selected_symbols = blocks.filter((block) => blocks.find((block) => block.name.includes(selected_group)))
	$: selected_symbols = blocks.filter((block) => block.name.includes(selected_group))

	let checked = []
</script>

<div class="BlockPicker">
	{#if !selected_group}
		<div class="symbol-groups">
			{#each symbol_groups as group}
				<button class="group-item" on:click={() => (selected_group = group)}>
					{group}
				</button>
			{/each}
		</div>
	{:else}
		<button class="back-button" on:click={() => (selected_group = null)}>
			<Icon icon="ep:back" />
			<span>Back to Groups</span>
		</button>
		<ul class="symbol-list">
			{#each selected_symbols as symbol}
				<li>
					<Symbol
						checked={checked.includes(symbol.id)}
						on:click={() => include_symbol(symbol)}
						{symbol}
						{site}
						{append}
						controls_enabled={false}
					/>
				</li>
			{/each}
		</ul>
	{/if}
</div>

<style lang="postcss">
	.BlockPicker {
		background: #222;
		padding: 1rem;
	}
	.symbol-groups {
		display: grid;
		grid-template-columns: 1fr 1fr 1fr;
		gap: 1rem;
	}
	ul.symbol-list {
		display: grid;
		grid-template-columns: 1fr 1fr 1fr;
		gap: 1rem;
	}
	.group-item {
		padding: 2rem;
		text-align: center;
		background: var(--color-gray-8);
	}
	button.back-button {
		font-size: 0.875rem;
		display: flex;
		align-items: center;
		gap: 2px;
		margin-bottom: 1rem;
		border-bottom: 1px solid var(--color-gray-1);
		padding-bottom: 3px;
	}
</style>
