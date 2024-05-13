<script>
	import { getIcon, loadIcon, buildIcon } from '@iconify/svelte'
	import TextInput from '../ui/TextInput.svelte'
	import { createEventDispatcher } from 'svelte'
	import { fade } from 'svelte/transition'
	import Icon from '@iconify/svelte'
	import axios from 'axios'

	const dispatch = createEventDispatcher()

	export let field
	export let value
	export let search_query = ''

	let searched = false

	$: console.log({ field })
	if (!getIcon(value) && !value.startsWith('<svg')) {
		// reset value when invalid (i.e. when switching field type)
		value = ''
	} else if (getIcon(value)) {
		// convert icon-id to icon-svg
		select_icon(value)
	}

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

	async function select_icon(icon) {
		const icon_data = await loadIcon(icon)
		if (icon_data) {
			// TODO: on-page icon picker
			const { attributes } = buildIcon(icon_data)
			const svg = `<svg xmlns="http://www.w3.org/2000/svg" data-key="${field.key}" data-icon="${icon}" aria-hidden="true" role="img" height="${attributes.height}" width="${attributes.width}" viewBox="${attributes.viewBox}" preserveAspectRatio="${attributes.preserveAspectRatio}">${icon_data.body}</svg>`
			// value = svg
			dispatch('input', { svg, icon })
		}
	}
</script>

<div class="IconPicker">
	{#if field.label}
		<p class="label">{field.label}</p>
	{/if}
	<div class="container">
		{#if value.startsWith('<svg')}
			<div class="icon-preview">
				{@html value}
			</div>
		{/if}
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
			{#each icons as icon}
				<button
					class="icon"
					class:active={value === icon}
					on:click={() => select_icon(icon)}
					type="button"
				>
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
