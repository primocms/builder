<script>
	import Item from './Item.svelte'
	import { PrimaryButton } from '$lib/components/buttons'
	import pages from '$lib/stores/data/pages'
	import { pages as actions } from '$lib/stores/actions'
	import { id as activePageID } from '$lib/stores/app/activePage'
	import PageForm from './PageForm.svelte'

	async function create_page(new_page) {
		const url_taken = $pages.some((page) => page.url === new_page.url)
		if (url_taken) {
			alert(`That URL is already in use`)
		} else {
			await actions.create(new_page)
		}
	}

	async function delete_page(page_id) {
		actions.delete(page_id)
	}

	let creating_page = null
</script>

<ul class="page-list root">
	{#each $pages.filter((p) => !p.parent) as page}
		{@const children = $pages.filter((p) => p.id !== page.id && p.parent === page.id)}
		<li>
			<Item
				{page}
				{children}
				active={$activePageID === page.id}
				on:create={({ detail: page }) => create_page(page)}
				on:delete={({ detail: terminal_page }) => delete_page(terminal_page.id)}
			/>
		</li>
	{/each}
	{#if creating_page}
		<li style="background: #1a1a1a;">
			<PageForm
				on:create={({ detail: new_page }) => {
					creating_page = false
					create_page(new_page)
				}}
			/>
		</li>
	{/if}
</ul>
<PrimaryButton
	variants="secondary"
	disabled={creating_page === true}
	on:click={() => (creating_page = true)}
	label="New Page"
	icon="akar-icons:plus"
/>

<style lang="postcss">
	ul.page-list {
		display: grid;
		gap: 0.5rem;
		color: var(--primo-color-white);

		margin-bottom: 1rem;

		li {
			/* overflow: hidden; */
		}

		/* &.root > li:not(:first-child) {
			border-top: 1px solid #222;
		} */
	}
</style>
