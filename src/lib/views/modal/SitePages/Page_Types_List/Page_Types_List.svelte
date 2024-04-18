<script>
	import { goto } from '$app/navigation'
	import Item from './Item.svelte'
	import { PrimaryButton } from '$lib/components/buttons'
	import page_types from '$lib/stores/data/page_types'
	import { page_types as actions } from '$lib/stores/actions'
	import { id as activePageID } from '$lib/stores/app/activePage'
	import { id as site_id } from '$lib/stores/data/site'
	import PageForm from './PageForm.svelte'
	import modal from '$lib/stores/app/modal'

	async function create_page(new_page) {
		const { id: page_type_id } = await actions.create(new_page)
		goto(`/${$site_id}/page-type--${page_type_id}`)
		modal.hide()
	}

	async function delete_page(page_id) {
		actions.delete(page_id)
	}

	let creating_page = null
</script>

{#if $page_types.length > 0}
	<ul class="page-list root">
		{#each $page_types as page}
			<li>
				<Item
					{page}
					active={$activePageID === page.id}
					on:edit={({ detail }) => {
						console.log({ detail })
						actions.update(page.id, detail)
					}}
					on:create={({ detail: page }) => {
						console.log('create page')
						// create_page(page)
					}}
					on:delete={({ detail: page }) => delete_page(page.id)}
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
{/if}
<PrimaryButton
	variants="secondary"
	disabled={creating_page === true}
	on:click={() => (creating_page = true)}
	label="New Page Type"
	icon="akar-icons:plus"
/>

<style lang="postcss">
	ul.page-list {
		display: grid;
		gap: 0.5rem;
		color: var(--primo-color-white);
		/* background: #1a1a1a; */
		border-radius: var(--primo-border-radius);
		margin-bottom: 1rem;

		li {
			border-radius: 0.25rem;
			/* overflow: hidden; */
		}

		/* &.root > li:not(:first-child) {
			border-top: 1px solid #222;
		} */
	}
</style>
