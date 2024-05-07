<script>
	import ModalHeader from '../../views/modal/ModalHeader.svelte'
	import Icon from '@iconify/svelte'
	import Symbol from '../../components/Site_Symbol.svelte'
	import { v4 as uuid } from 'uuid'
	import { Symbol as Create_Symbol } from '../../factories'
	import primo_symbols from '../../stores/data/primo_symbols'

	export let site, append, onsave

	let selected = []

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

	let checked = []
</script>

<ModalHeader
	icon="lucide:blocks"
	title="Add Blocks to Site"
	button={{
		label: `Add ${selected.length} Blocks`,
		onclick: () => onsave(selected),
		icon: 'lucide:blocks',
		disabled: selected.length === 0
	}}
/>
<div class="BlockPicker">
	{#if !selected_group}
		<div class="symbol-groups">
			{#each $primo_symbols as group}
				<button class="group-item" on:click={() => (selected_group = group)}>
					{group.name}
				</button>
			{/each}
		</div>
	{:else}
		<button class="back-button" on:click={() => (selected_group = null)}>
			<Icon icon="ep:back" />
			<span>Back to Groups</span>
		</button>
		<ul class="symbol-list">
			{#each selected_group.symbols as symbol}
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
