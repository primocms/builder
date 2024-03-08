<script>
	import Icon from '@iconify/svelte'
	import { fade } from 'svelte/transition'
	import { createEventDispatcher } from 'svelte'
	const dispatch = createEventDispatcher()

	export let tabs
	export let active_tab_id = tabs[0]?.id

	$: dispatch('switch', active_tab_id)
</script>

{#if tabs.length > 1}
	<div class="tabs" in:fade={{ duration: 200 }}>
		{#each tabs as tab, i}
			<button
				class:active={active_tab_id === tab.id}
				on:click={() => (active_tab_id = tab.id)}
				id={tab.id ? `tab-${tab.id}` : null}
			>
				{#if tab.icon}
					<Icon icon={tab.icon} />
				{/if}
				{typeof tab === 'string' ? tab : tab.label}
			</button>
		{/each}
	</div>
{/if}

<style lang="postcss">
	.tabs {
		display: flex;
		justify-content: center;
		border-bottom: 1px solid #222;
		color: white;
		font-size: 0.875rem;
		button {
			font-size: 0.875rem;
			padding: 0.75rem 1rem;
			display: flex;
			align-items: center;
			gap: 0.25rem;
			border-bottom: 1px solid #222;
			transition: 0.1s;

			&.active {
				border-bottom-color: var(--primo-color-brand);
			}
		}
	}
</style>
