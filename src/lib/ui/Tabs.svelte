<script>
	import Icon from '@iconify/svelte'
	import { fade } from 'svelte/transition'
	import { createEventDispatcher } from 'svelte'
	import { showKeyHint } from '../stores/app/misc.js'
	import hotkey_events from '../stores/app/hotkey_events.js'
	const dispatch = createEventDispatcher()

	export let tabs
	export let active_tab_id = tabs[0]?.id
	export let variant = 'primary'
	export let disable_hotkeys = false

	// hotkey_events.on('tab-switch', (tab) => (active_tab_id = tabs[tab - 1]?.id))

	$: dispatch('switch', active_tab_id)
</script>

{#if tabs.length > 1}
	<div class="tabs {variant}" in:fade={{ duration: 200 }}>
		{#each tabs as tab, i}
			<button
				class:active={active_tab_id === tab.id}
				class:showing_key_hint={$showKeyHint && !disable_hotkeys}
				on:click={() => (active_tab_id = tab.id)}
				id={tab.id ? `tab-${tab.id}` : null}
			>
				{#if $showKeyHint && !disable_hotkeys}
					<span class="key-hint">&#8984; {i + 1}</span>
				{/if}
				<span class="label">
					{#if tab.icon}
						<Icon icon={tab.icon} />
					{/if}
					<span>{typeof tab === 'string' ? tab : tab.label}</span>
				</span>
			</button>
		{/each}
	</div>
{/if}

<style lang="postcss">
	.tabs {
		display: flex;
		justify-content: center;
		color: white;
		font-size: 0.875rem;
		padding-inline: 1rem;

		&.secondary {
			font-size: 0.75rem;
			justify-content: initial;
		}

		button {
			flex: 1;
			padding: 0.75rem 1rem;
			display: flex;
			align-items: center;
			justify-content: center;
			gap: 0.25rem;
			color: var(--color-gray-2);
			border-bottom: 1px solid var(--color-gray-8);
			transition: 0.1s;

			&:focus-visible {
				outline: 1px solid var(--primo-color-brand);
			}

			&.active {
				color: white;
				border-bottom-color: var(--primo-color-brand);
			}

			&.showing_key_hint .label {
				visibility: hidden;
			}

			.key-hint {
				position: absolute;
			}

			.label {
				display: flex;
				align-items: center;
				gap: 0.25rem;
			}

			.label > span {
				white-space: nowrap;
				display: none;
				margin-left: 0.25rem;

				@media (min-width: 500px) {
					display: inline-block;
				}
			}
		}
	}
</style>
