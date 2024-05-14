<script>
	import Icon from '@iconify/svelte'
	import { slide } from 'svelte/transition'
	import { get, set } from 'idb-keyval'
	import { createEventDispatcher, getContext } from 'svelte'
	const dispatch = createEventDispatcher()
	import modal from '../../../../stores/app/modal'
	import pages from '../../../../stores/data/pages'
	import { id as active_pageID } from '../../../../stores/app/active_page'
	import { pages as actions } from '../../../../stores/actions'
	import { content_editable, validate_url } from '../../../../utilities'
	import PageForm from './PageForm.svelte'
	import MenuPopup from '../../../../ui/Dropdown.svelte'

	/** @type {import('$lib').Page | null}*/
	export let parent = null

	/** @type {import('$lib').Page}*/
	export let page
	export let children = []
	export let active

	let editing_page = false
	/** @type {string[]}*/
	export let parent_urls = []

	const site_url = window.location.pathname.split('/')[1]
	const full_url = parent
		? `/${site_url}/${parent_urls.join('/')}/${page.slug}`
		: `/${site_url}/${page.slug}`

	let showing_children = false
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
</script>

<div
	class="page-item-container"
	class:contains-child={parent}
	class:active={page.id === $active_pageID}
	class:expanded={showing_children && has_children}
>
	<div class="left">
		{#if editing_page}
			<div class="details">
				<div
					class="name"
					use:content_editable={{
						autofocus: true,
						on_change: (val) => edit_page({ name: val }),
						on_submit: () => (editing_page = false)
					}}
				>
					{page.name}
				</div>
				{#if page.slug !== 'index'}
					<div class="url">
						<span>/</span>
						<div
							class="url"
							use:content_editable={{
								on_change: (val) => {
									edit_page({ url: validate_url(val) })
								},
								on_submit: () => (editing_page = false)
							}}
						>
							{page.slug}
						</div>
					</div>
				{/if}
			</div>
		{:else}
			{@const url = page.slug !== 'index' ? page.slug : ''}
			<div class="details">
				<a class:active href={full_url} on:click={() => modal.hide()} class="name">{page.name}</a>
				<span class="url">/{url}</span>
				{#if page.page_type}
					<span
						style="font-size: 0.75rem;
						background: {page.page_type.color};
						padding: 6px;
						border-radius: 1rem;
						display: flex;
						justify-content: center;
						align-items: center;"
					>
						<Icon icon={page.page_type.icon} />
					</span>
				{/if}
			</div>
		{/if}
		{#if has_children}
			<button
				class="toggle"
				class:active={showing_children}
				on:click={() => (showing_children = !showing_children)}
				aria-label="Toggle child pages"
			>
				<Icon icon="mdi:chevron-down" />
			</button>
		{/if}
	</div>
	<div class="options">
		<MenuPopup
			icon="carbon:overflow-menu-vertical"
			options={[
				...(page.slug !== 'index' && !creating_page
					? [
							{
								label: `New Child Page`,
								icon: 'akar-icons:plus',
								on_click: () => {
									creating_page = true
								}
							}
					  ]
					: []),
				{
					label: 'Change Name',
					icon: 'clarity:edit-solid',
					on_click: () => {
						editing_page = !editing_page
					}
				},
				...(page.slug !== 'index'
					? [
							{
								label: 'Delete',
								icon: 'ic:outline-delete',
								on_click: () => dispatch('delete', page)
							}
					  ]
					: [])
			]}
		/>
	</div>
</div>

{#if creating_page}
	<div style="border-left: 0.5rem solid #111;">
		<PageForm
			{page}
			parent={page.id}
			on:create={({ detail: page }) => {
				creating_page = false
				showing_children = true
				dispatch('create', page)
			}}
		/>
	</div>
{/if}

{#if showing_children && has_children}
	<ul class="page-list child">
		{#each children as subpage}
			{@const subchildren = $pages.filter((p) => p.parent === subpage.id)}
			<li>
				<svelte:self
					parent={page}
					page={subpage}
					parent_urls={[...parent_urls, page.slug]}
					children={subchildren}
					active={$active_pageID === subpage.id}
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
		border-bottom-left-radius: 0.25rem;
		background: #1a1a1a;
		border-radius: var(--primo-border-radius);
		&.expanded {
			border-bottom-right-radius: 0;
			border-bottom: 1px solid var(--color-gray-9);
		}
		&.contains-child {
			padding-block: 0.5rem;
			border-radius: 0;
		}

		&.active {
			background: #222;
			border-bottom-right-radius: 0;
			/* outline: 1px solid var(--primo-color-brand); */
		}

		.left {
			display: flex;
			align-items: center;
			gap: 0.5rem;

			.details {
				font-weight: 400;
				line-height: 1.5rem;
				display: grid;
				grid-template-columns: auto auto 1fr;
				gap: 1rem;
				color: var(--color-gray-1);

				a.name {
					white-space: nowrap;
					overflow: hidden;
					text-overflow: ellipsis;
					border-bottom: 1px solid transparent;
					margin-bottom: -1px;
					transition: 0.1s;
					&:hover {
						border-color: white;
					}
				}

				.url {
					white-space: nowrap;
					overflow: hidden;
					text-overflow: ellipsis;
					font-weight: 400;
					color: var(--color-gray-5);
				}

				div.name,
				div.url {
					white-space: nowrap;
					overflow: hidden;
					text-overflow: ellipsis;
					width: 100%;
					color: var(--primo-color-brand);

					span {
						color: var(--color-gray-5);
					}

					&:focus {
						outline: none;
					}
				}
			}

			.toggle {
				padding: 0 0.5rem;
				transition: 0.1s color;
				font-size: 1.5rem;

				&:hover {
					color: var(--primo-color-brand);
				}

				&.active {
					transform: scaleY(-1);
				}
			}
		}

		.options {
			display: flex;
			gap: 0.75rem;
		}
	}

	ul.page-list {
		margin: 0 1rem 1rem 1rem;
		/* background: #323334; */
		border-radius: var(--primo-border-radius);

		li:not(:last-child) {
			/* border-bottom: 1px solid #222; */
		}

		&.child {
			font-size: 0.875rem;
			margin: 0;
			border-top: 1px solid #222;
			/* margin-left: 1rem; */
			border-top-right-radius: 0;
			border-top-left-radius: 0;
		}

		&.child:not(.entry) {
			margin-left: 0.5rem;
		}
	}
</style>
