<script>
	import Item from './Item.svelte'
	import { PrimaryButton } from '../../../../components/buttons'
	import pages from '../../../../stores/data/pages'
	import { pages as actions } from '../../../../stores/actions'
	import { id as active_pageID } from '../../../../stores/app/active_page'
	import PageForm from './PageForm.svelte'

	async function create_page(new_page, index) {
		const url_taken = $pages.some((page) => page.slug === new_page.slug)
		if (url_taken) {
			alert(`That URL is already in use`)
		} else {
			await actions.create({ ...new_page, index })
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
				active={$active_pageID === page.id}
				on:create={({ detail }) => create_page(detail.page, detail.index)}
				on:delete={({ detail: terminal_page }) => delete_page(terminal_page.id)}
			/>
		</li>
	{/each}
	{#if creating_page}
		<li style="background: #1a1a1a;">
			<PageForm
				on:create={({ detail: new_page }) => {
					creating_page = false
					create_page(new_page, $pages.length)
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
