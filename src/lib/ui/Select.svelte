<script>
	import { createEventDispatcher } from 'svelte'
	import _ from 'lodash-es'
	import { fade } from 'svelte/transition'
	import Icon from '@iconify/svelte'
	import { clickOutside, createUniqueID } from '../utilities.js'
	import { createPopperActions } from 'svelte-popperjs'

	const dispatch = createEventDispatcher()

	export let label
	export let options = []
	export let value = options[0]['value']
	export let fallback_label = null
	export let dividers = []
	export let placement = 'bottom-start'
	export let variant = 'small' // or 'large'
	export let fullwidth = false

	const [popperRef, popperContent] = createPopperActions({
		placement,
		strategy: 'fixed',
		modifiers: fullwidth
			? [
					{ name: 'offset', options: { offset: [0, 3] } },
					{
						name: 'sameWidth',
						enabled: true,
						fn: ({ state }) => {
							state.styles.popper.width = `${state.rects.reference.width}px`
						},
						phase: 'beforeWrite',
						requires: ['computeStyles']
					}
			  ]
			: [{ name: 'offset', options: { offset: [0, 3] } }]
	})

	let showing_dropdown = false

	let active_submenu = null
	let selected_submenu_option = null

	const select_id = createUniqueID()

	$: selected = options.find((option) => option.value === value)

	// highlight button when passed value changes (i.e. when auto-changing field type based on name)
	let highlighted = false
	let disable_highlight = true // prevent highlighting on initial value set
	let manually_selected = false // or manual set
	$: value, highlight_button()
	function highlight_button() {
		if (disable_highlight) {
			disable_highlight = false
			return
		} else if (!manually_selected) {
			highlighted = true
			setTimeout(() => {
				highlighted = false
			}, 400)
		}
	}
</script>

<div
	class="Select {variant}"
	use:clickOutside
	on:click_outside={() => (showing_dropdown = false)}
	role="menu"
>
	<div class="select-container">
		{#if label}
			<label class="primo--field-label" for={select_id}>{label}</label>
		{/if}
		<button
			id={select_id}
			class="primary"
			class:highlighted
			type="button"
			use:popperRef
			on:click={() => (showing_dropdown = !showing_dropdown)}
		>
			{#if selected}
				{#if selected.icon}
					<div class="icon">
						<Icon icon={selected.icon} />
					</div>
				{/if}
				<p>{selected.label}</p>
			{:else}
				<p>{fallback_label}</p>
			{/if}
			<span class="dropdown-icon">
				<Icon icon="mi:select" />
			</span>
		</button>
	</div>
	{#if showing_dropdown}
		<div class="popup" in:fade={{ duration: 100 }} use:popperContent>
			{#if !active_submenu}
				<div class="options">
					{#each options as option, i}
						{@const has_submenu_items = option.suboptions?.length > 0}
						<div class="item">
							<button
								class:active={label === option.label}
								on:click={(e) => {
									manually_selected = true
									if (option.on_click) {
										showing_dropdown = false
										option.on_click(e)
									} else {
										showing_dropdown = false
										dispatch('input', option.value)
									}
								}}
								type="button"
							>
								<Icon icon={option.icon} />
								<span>{option.label}</span>
							</button>
							{#if has_submenu_items}
								<button
									on:click={() => {
										active_submenu = { title: option.label, options: option.suboptions }
									}}
								>
									<Icon icon="material-symbols:chevron-right" />
								</button>
							{/if}
						</div>

						{#if dividers.includes(i)}
							<hr />
						{/if}
					{/each}
				</div>
			{:else if active_submenu}
				<div class="submenu" in:fade={{ duration: 100 }}>
					<header>
						<span>{active_submenu.title}</span>
						<button on:click={() => (active_submenu = null)} type="button">
							<Icon icon="carbon:close" />
						</button>
					</header>
					<div class="options">
						<!-- async submenu fetch not being used atm, but keeping as a reference for fetching child pages in PageList later (instead of fetching all pages at once)-->
						{#if typeof options === 'function'}
							{#await options()}
								<Icon width="25" icon="line-md:loading-twotone-loop" />
							{:then items}
								{#each items as { label, value, onclick }}
									<button
										on:click={() => {
											manually_selected = true
											if (onclick) {
												onclick()
											} else {
												dispatch('input', value)
											}
										}}
										type="button"
									>
										{label}
									</button>
								{/each}
							{/await}
						{:else}
							{#each active_submenu.options as { label, value, onclick }}
								<div class="item">
									<button
										on:click={() => {
											showing_dropdown = false
											active_submenu = null
											if (onclick) {
												onclick()
											} else {
												dispatch('input', value)
											}
										}}
										type="button"
									>
										{label}
									</button>
								</div>
							{/each}
						{/if}
					</div>
				</div>
			{/if}
		</div>
	{/if}
</div>

<style lang="postcss">
	.Select {
		/* width: 100%; */
		flex: 1;
		position: relative;
		opacity: var(--Select-opacity, 1);

		&.large {
			.icon,
			.popup,
			p {
				font-size: 1rem !important;
			}
		}
	}
	.select-container {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
	}
	.icon {
		font-size: 0.75rem;
	}
	button.primary {
		display: flex;
		align-items: center;
		justify-content: flex-start;
		gap: 0.5rem;
		border: 1px solid var(--color-gray-8);
		padding: 6px 0.5rem;
		padding-right: 4px; /* offset dropdown icon */
		width: 100%;
		border-radius: var(--primo-border-radius);
		font-size: 0.875rem;
		display: grid;
		grid-template-columns: auto 1fr auto;
		transition: 0.1s;

		&.highlighted {
			color: var(--primo-color-brand);
		}

		p {
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
		}

		.dropdown-icon {
			margin-left: auto;
		}
	}
	hr {
		border-color: var(--color-gray-8);
	}
	.popup {
		display: grid;
		gap: 0.375rem;
		place-items: normal;
		padding: 0.25rem;
		font-size: 0.75rem;
		border-radius: 0.25rem;
		/* position: absolute;
		left: 0;
		top: 38px; */
		background: #171717;
		border: 1px solid #292929;
		z-index: 1;

		.options {
			hr {
				margin-block: 0.25rem;
			}
		}

		.item {
			display: flex;
			align-items: stretch;
		}
	}
	.submenu {
		header {
			font-weight: 600;
			padding: 0.25rem 0.5rem;
			padding-right: 0;

			white-space: nowrap;
			display: flex;
			justify-content: space-between;
			align-items: center;
			border-bottom: 1px solid var(--color-gray-8);
			margin-bottom: 0.25rem;

			span {
				font-weight: 500;
			}
		}
	}

	button {
		display: flex;
		align-items: center;
		/* justify-content: space-between; */
		gap: 0.375rem;
		border-radius: 0.25rem;
		padding: 0.25rem;
		/* width: 100%; */
		text-align: left;
		white-space: nowrap;

		&:first-child {
			flex: 1;
		}

		&:hover:not(.active) {
			background: #292929;
		}

		&.active {
			cursor: initial;
			opacity: 0.5;
		}
	}
</style>
