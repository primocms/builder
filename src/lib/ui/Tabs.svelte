<script>
	import { onDestroy } from 'svelte'
	import * as Mousetrap from 'mousetrap'
	import Icon from '@iconify/svelte'
	import { fade } from 'svelte/transition'
	import { createEventDispatcher } from 'svelte'
	import { showKeyHint } from '../stores/app/misc.js'
	const dispatch = createEventDispatcher()

	export let tabs
	export let active_tab_id = tabs[0]?.id

	if (!import.meta.env.SSR) {
		Mousetrap.bind(['mod+1'], (e) => {
			e.preventDefault()
			active_tab_id = tabs[0]['id']
		})
		Mousetrap.bind(['mod+2'], (e) => {
			e.preventDefault()
			active_tab_id = tabs[1]['id']
		})
		Mousetrap.bind(['mod+3'], (e) => {
			e.preventDefault()
			active_tab_id = tabs[2]['id']
		})
	}

	onDestroy(() => Mousetrap.unbind(['mod+1', 'mod+2', 'mod+3']))

	$: dispatch('switch', active_tab_id)
</script>

{#if tabs.length > 1}
	<div class="tabs" in:fade={{ duration: 200 }}>
		{#each tabs as tab, i}
			<button
				class:active={active_tab_id === tab.id}
				class:showing_key_hint={$showKeyHint}
				on:click={() => (active_tab_id = tab.id)}
				id={tab.id ? `tab-${tab.id}` : null}
			>
				{#if $showKeyHint}
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
		button {
			font-size: 0.875rem;
			padding: 0.75rem 1rem;
			display: flex;
			align-items: center;
			justify-content: center;
			gap: 0.25rem;
			border-bottom: 1px solid var(--color-gray-8);
			transition: 0.1s;

			&.active {
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
				display: none;
				margin-left: 0.25rem;

				@media (min-width: 500px) {
					display: inline-block;
				}
			}
		}
	}
</style>
