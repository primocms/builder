<script>
	import ModalHeader from '../ModalHeader.svelte'
	import PageList from './PageList/PageList.svelte'
	import Page_Types_List from './Page_Types_List/Page_Types_List.svelte'
	import Icon from '@iconify/svelte'

	let current_step = localStorage.getItem('current_step') || 'pages'
	function set_current_step(step) {
		localStorage.setItem('current_step', step)
		current_step = step
	}
</script>

<ModalHeader>
	<div class="tabs" slot="title">
		<button class:active={current_step === 'pages'} on:click={() => set_current_step('pages')}>
			<Icon icon="fluent:document-one-page-multiple-20-filled" />
			<span>Pages</span>
		</button>
		<button
			class:active={current_step === 'page types'}
			on:click={() => set_current_step('page types')}
		>
			<Icon icon="carbon:template" />
			<span>Page Types</span>
		</button>
	</div>
</ModalHeader>

<main>
	{#if current_step === 'pages'}
		<PageList />
	{:else}
		<Page_Types_List />
	{/if}
</main>

<style lang="postcss">
	.tabs {
		display: flex;
		justify-content: center;
		color: white;

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
	main {
		padding: 1rem;
		padding-top: 0.5rem;
		background: var(--primo-color-black);
		overflow-y: scroll;
	}
</style>
