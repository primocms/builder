<script>
	import { createEventDispatcher } from 'svelte'
	import _ from 'lodash-es'
	import { fade } from 'svelte/transition'
	import UI from '$lib/ui'
	import Icon from '@iconify/svelte'
	import { clickOutside } from '$lib/utilities'
	import { createPopperActions } from 'svelte-popperjs'
	// import { toast } from '@zerodevx/svelte-toast';

	const dispatch = createEventDispatcher()

	export let label = ''
	export let icon = ''
	export let options = []
	export let dividers = []
	export let placement = 'bottom-start'

	const [popperRef, popperContent] = createPopperActions({
		placement,
		strategy: 'fixed'
	})

	let showing_dropdown = false

	let active_submenu = null
	let selected_submenu_option = null
</script>

<div
	class="Dropdown"
	use:clickOutside
	on:click_outside={() => (showing_dropdown = false)}
	role="menu"
>
	{#if label}
		<button
			class="primary"
			type="button"
			use:popperRef
			on:click={() => {
				showing_dropdown = !showing_dropdown
			}}
		>
			<Icon {icon} />
			<p>{label}</p>
			<span class="dropdown-icon">
				<Icon icon="mi:select" />
			</span>
		</button>
	{:else}
		<button use:popperRef on:click={() => (showing_dropdown = !showing_dropdown)} type="button">
			<Icon icon="carbon:overflow-menu-vertical" />
		</button>
	{/if}
	{#if showing_dropdown}
		<div
			class="popup"
			in:fade={{ duration: 100 }}
			use:popperContent={{
				modifiers: [{ name: 'offset', options: { offset: [0, 3] } }]
			}}
		>
			{#if !active_submenu}
				<div class="options">
					{#each options as option, i}
						{@const has_submenu_items = option.submenu?.options?.length > 0}
						<button
							class:active={label === option.label}
							class:has_submenu={has_submenu_items}
							on:click={(e) => {
								if (option.on_click) {
									showing_dropdown = false
									option.on_click(e)
								} else if (option.submenu?.options?.length > 0) {
									active_submenu = option.submenu
								} else {
									showing_dropdown = false
									dispatch('input', option.value)
								}
							}}
							type="button"
						>
							<Icon icon={option.icon} />
							<span>{option.label}</span>
							{#if has_submenu_items}
								<Icon icon="material-symbols:chevron-right" />
							{/if}
						</button>
						{#if dividers.includes(i)}
							<hr />
						{/if}
					{/each}
				</div>
			{:else if active_submenu}
				{@const { title, options } = active_submenu}
				<div class="submenu" in:fade={{ duration: 100 }}>
					<header>
						<span>{title}</span>
						<button
							on:click={() => {
								active_submenu = null
								selected_submenu_option = null
							}}
							type="button"
						>
							<Icon icon="carbon:close" />
						</button>
					</header>
					<div class="suboptions">
						<!-- async submenu fetch not being used atm, but keeping as a reference for fetching child pages in PageList later (instead of fetching all pages at once)-->
						{#if typeof options === 'function'}
							{#await options()}
								<Icon width="25" icon="line-md:loading-twotone-loop" />
							{:then items}
								{#each items as { label, value, onclick }}
									<button
										on:click={() => {
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
							{#each options as { label, value, onclick }}
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
							{/each}
						{/if}
					</div>
				</div>
			{/if}
		</div>
	{/if}
</div>

<style lang="postcss">
	.Dropdown {
		width: 100%;
		position: relative;
		opacity: var(--Dropdown-opacity, 1);
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
		white-space: nowrap;

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

		button {
			display: flex;
			align-items: center;
			/* justify-content: space-between; */
			gap: 0.375rem;
			border-radius: 0.25rem;
			padding: 0.25rem 0.5rem;
			width: 100%;
			text-align: left;
			white-space: nowrap;

			&:hover:not(.active) {
				background: #292929;
			}

			&.active {
				cursor: initial;
				opacity: 0.5;
			}

			&.has_submenu {
				padding-right: 3px;
			}
		}
	}
	.submenu {
		header {
			padding-inline: 0.25rem;
			white-space: nowrap;
			display: flex;
			justify-content: space-between;
			gap: 1rem;
			margin-bottom: 0.25rem;

			span {
				font-weight: 500;
			}

			button {
				width: initial;
				padding: 0.25rem;
			}
		}
	}
</style>
