<script>
	import TextInput from '../ui/TextInput.svelte'
	import { createEventDispatcher } from 'svelte'
	import { fade } from 'svelte/transition'
	import Icon from '@iconify/svelte'
	import axios from 'axios'
	import { createPopperActions } from 'svelte-popperjs'
	import { clickOutside } from '../utilities'

	const dispatch = createEventDispatcher()

	export let icon
	export let search_query = ''
	export let variant = 'large' // or 'small'

	const [popperRef, popperContent] = createPopperActions({
		placement: 'bottom-start',
		strategy: 'fixed'
	})

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

	let showing_popover = false
</script>

<div class="IconPicker {variant}">
	<div class="container">
		{#if variant === 'large'}
			<div class="icon-preview">
				<Icon {icon} />
			</div>
			<form on:submit|preventDefault={search}>
				<TextInput
					bind:value={search_query}
					prefix_icon="tabler:search"
					label="Search icons"
					button={{ label: 'Search', type: 'submit', disabled: !search_query }}
				/>
			</form>
		{:else if variant === 'small'}
			<button
				class="icon-preview"
				aria-label="select icon"
				use:popperRef
				on:click={() => (showing_popover = !showing_popover)}
			>
				<Icon {icon} />
			</button>
		{/if}
	</div>
	{#if showing_popover}
		<div
			class="popup"
			in:fade={{ duration: 100 }}
			use:clickOutside
			on:click_outside={() => (showing_popover = false)}
			use:popperContent={{
				modifiers: [{ name: 'offset', options: { offset: [0, 3] } }]
			}}
		>
			<form on:submit|preventDefault={search}>
				<TextInput
					autofocus={true}
					bind:value={search_query}
					prefix_icon="tabler:search"
					label="Search icons"
					button={{ label: 'Search', type: 'submit', disabled: !search_query }}
				/>
			</form>
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
							on:click={() => {
								dispatch('input', item)
								showing_popover = false
							}}
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
	{/if}
	{#if searched && variant === 'large'}
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
	.IconPicker.small {
		.icon-preview {
			font-size: 22px;
		}
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

	.popup {
		background: var(--color-gray-9);
		padding: 0.5rem;
		z-index: 1;
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
