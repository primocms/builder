<script>
	import TextInput from '$lib/components/inputs/TextInput.svelte'
	import { createEventDispatcher } from 'svelte'
	import { fade } from 'svelte/transition'
	import Icon from '@iconify/svelte'
	import axios from 'axios'

	const dispatch = createEventDispatcher()

	export let field

	let search_query = ''
	let searched = false

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

	function select_icon(icon) {
		field.value = icon
		dispatch('input')
	}
</script>

<div>
	<p class="label">{field.label}</p>
	<div class="container">
		{#if field.value}
			<div class="icon-preview">
				<Icon icon={field.value} />
			</div>
		{/if}
		<form on:submit|preventDefault={search}>
			<TextInput
				bind:value={search_query}
				prefix_icon="tabler:search"
				label="Search icons"
				button={{ label: 'Search', type: 'submit' }}
			/>
		</form>
	</div>
	{#if searched}
		<div class="icons" in:fade>
			{#each icons as icon}
				<button class:active={field.value === icon} on:click={() => select_icon(icon)}>
					<Icon {icon} width="50px" />
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
	.label {
		margin-bottom: 0.5rem;
		font-size: var(--label-font-size, 1rem);
		font-weight: var(--label-font-weight, 700);
	}

	.container {
		display: flex;
		flex-direction: row;
		gap: 1rem;
	}

	.icon-preview {
		font-size: 3rem;
		border: 1px solid var(--color-gray-6);
		padding: 0.25rem;
		border-radius: var(--primo-border-radius);
	}

	form {
		flex: 1;
	}

	.icons {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(52px, 1fr));
		border: 1px solid var(--color-gray-7);
		margin-top: 0.25rem;
		border-radius: var(--primo-border-radius);
	}

	button {
		transition: 0.1s;

		&.active {
			color: var(--primo-color-brand);
		}
	}
</style>
