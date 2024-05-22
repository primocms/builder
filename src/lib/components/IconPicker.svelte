<script>
	import TextInput from '../ui/TextInput.svelte'
	import { createEventDispatcher } from 'svelte'
	import { fade } from 'svelte/transition'
	import Icon from '@iconify/svelte'
	import axios from 'axios'

	const dispatch = createEventDispatcher()

	export let icon
	export let search_query = ''

	let searched = false

	// search immediately when passed a query
	if (search_query) {
		search()
	}

	// hide icons when clearing search text
	$: if (search_query === '') {
		searched = false
	}

	let icons = []
	async function search() {
		axios
			.get(
				`https://api.iconify.design/search?query=${encodeURIComponent(
					search_query.trim()
				)}&limit=32`
			)
			.then(({ data }) => {
				icons = data.icons
				searched = true
			})
	}
</script>

<div class="IconPicker">
	<div class="container">
		<div class="icon-preview">
			<Icon {icon} />
		</div>
		<!-- {#if icon.startsWith('<svg')}
			<div class="icon-preview">
				{@html icon}
			</div>
		{/if} -->
		<form on:submit|preventDefault={search}>
			<TextInput
				bind:value={search_query}
				prefix_icon="tabler:search"
				label="Search icons"
				button={{ label: 'Search', type: 'submit', disabled: !search_query }}
			/>
		</form>
	</div>
	{#if searched}
		<div class="icons" in:fade>
			<button
				class="close"
				aria-label="Close"
				on:click={() => {
					searched = false
					search_query = ''
				}}
			>
				<Icon icon="material-symbols:close" />
			</button>
			{#each icons as item}
				<button
					class="icon"
					class:active={item === icon}
					on:click={() => dispatch('input', item)}
					type="button"
				>
					<Icon icon={item} width="50px" />
				</button>
			{:else}
				<span
					style="grid-column: 1 / -1;
				padding: 0.5rem;
				font-size: 0.875rem;
				border-left: 3px solid red;"
				>
					No icons found
				</span>
			{/each}
		</div>
	{/if}
</div>

<style lang="postcss">
	.container {
		display: flex;
		flex-direction: row;
		gap: 1rem;
	}

	.icon-preview {
		font-size: 3rem;
		border: 1px solid var(--color-gray-8);
		padding: 0.25rem;
		border-radius: var(--primo-border-radius);
	}

	form {
		flex: 1;
	}

	.icons {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(52px, 1fr));
		border: 1px solid var(--color-gray-8);
		margin-top: 0.25rem;
		border-radius: var(--primo-border-radius);
		position: relative;
		margin-top: 0.25rem;
		padding: 0.75rem;

		button.close {
			position: absolute;
			top: 0;
			right: 0;
			padding: 0.5rem;

			&:hover {
				color: var(--color-gray-4);
			}
		}
	}

	button {
		transition: 0.1s;

		&.active {
			color: var(--primo-color-brand);
		}
	}
</style>
