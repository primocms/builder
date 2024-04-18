<script>
	import Icon from '@iconify/svelte'
	import { slide } from 'svelte/transition'
	import { get, set } from 'idb-keyval'
	import { createEventDispatcher, getContext } from 'svelte'
	const dispatch = createEventDispatcher()
	import pages from '../../../../stores/data/pages'
	import { id as activePageID } from '../../../../stores/app/activePage'
	import { id as siteID } from '../../../../stores/data/site'
	import { pages as actions } from '../../../../stores/actions'
	import { validate_url } from '../../../../utilities'
	import PageForm from './PageForm.svelte'
	import MenuPopup from '../../../../ui/Dropdown.svelte'
	import modal from '../../../../stores/app/modal'

	/** @type {import('$lib').Page_Type}*/
	export let page
	export let children = []

	let editing_page = false

	let showing_children = true
	$: has_children = children.length > 0

	get(`page-list-toggle--${page.id}`).then((toggled) => {
		if (toggled !== undefined) showing_children = toggled
	})
	$: set(`page-list-toggle--${page.id}`, showing_children)

	let creating_page = false
	let new_page_url = ''
	$: new_page_url = validate_url(new_page_url)

	/**
	 * @param {{ name?: string, url?: string }} args
	 */
	function edit_page(args) {
		actions.update(page.id, args)
	}

	const full_url = `/${$siteID}/page-type--${page.id}`
</script>

{#if editing_page}
	<PageForm
		{page}
		new_page_name={page.name}
		new_color={page.color}
		new_icon={page.icon}
		on:create={({ detail: modified_page }) => {
			editing_page = false
			console.log('first')
			dispatch('edit', modified_page.details)
		}}
	/>
{:else}
	<div
		class="page-item-container"
		class:active={page.id === $activePageID}
		class:expanded={showing_children}
	>
		<div class="left">
			<span class="icon" style="padding: 7px; background: {page.color};border-radius: 1rem;">
				{#if page.icon}
					<Icon icon={page.icon} />
				{/if}
			</span>
			<a class="name" href={full_url} on:click={() => modal.hide()}>
				{page.name}
			</a>
		</div>
		<div class="options">
			<MenuPopup
				icon="carbon:overflow-menu-vertical"
				options={[
					{
						label: 'Change Name',
						icon: 'clarity:edit-solid',
						on_click: () => {
							editing_page = !editing_page
						}
					},
					{
						label: 'Delete Page Type',
						icon: 'fluent:delete-20-filled',
						on_click: () => {
							const confirm = window.confirm(
								`This will delete ALL pages of this page type. Continue?`
							)
							if (confirm) {
								dispatch('delete', page)
							}
						}
					}
				]}
			/>
		</div>
	</div>
{/if}

{#if creating_page}
	<div style="border-left: 0.5rem solid #111;">
		<PageForm
			{page}
			on:create={({ detail: page }) => {
				creating_page = false
				dispatch('create', page)
			}}
		/>
	</div>
{/if}

{#if showing_children && has_children}
	<ul class="page-list child" transition:slide={{ duration: 100 }}>
		{#each children as subpage}
			{@const subchildren = $pages.filter((p) => p.parent === subpage.id)}
			<li>
				<svelte:self
					parent={page}
					page={subpage}
					active={$activePageID === subpage.id}
					on:delete
					on:create
				/>
			</li>
		{/each}
	</ul>
{/if}

<style lang="postcss">
	.page-item-container {
		display: flex;
		justify-content: space-between;
		padding: 0.875rem 1.125rem;
		background: #1a1a1a;
		border-radius: var(--primo-border-radius);
		border-top-left-radius: 0;
		border-bottom-left-radius: 0;

		&.expanded {
			border-bottom-right-radius: 0;
		}

		&.active {
			background: #222;
			/* outline: 1px solid var(--primo-color-brand); */
		}

		.left {
			display: flex;
			align-items: center;
			gap: 0.5rem;

			a.name {
				border-bottom: 1px solid transparent;
				margin-bottom: -1px;
				transition: 0.1s;
				&:hover {
					border-color: white;
				}
			}

			.name {
				font-weight: 400;
				line-height: 1.5rem;
				display: flex;
				gap: 1rem;
				color: var(--color-gray-1);
			}
		}

		.options {
			display: flex;
			gap: 0.75rem;
		}
	}

	ul.page-list {
		margin: 0 1rem 1rem 1rem;
		border-radius: var(--primo-border-radius);

		li:not(:last-child) {
			/* border-bottom: 1px solid #222; */
		}

		&.child {
			font-size: 0.875rem;
			margin: 0;
			/* margin-left: 1rem; */
		}

		&.child:not(.entry) {
			margin-left: 0.5rem;
		}
	}
</style>
