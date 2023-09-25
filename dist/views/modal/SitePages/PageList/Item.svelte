<script>
	import Icon from '@iconify/svelte'
	import { slide } from 'svelte/transition'
	import { get, set } from 'idb-keyval'
	import { createEventDispatcher, getContext } from 'svelte'
	const dispatch = createEventDispatcher()
	import modal from '../../../../stores/app/modal'
	import pages from '../../../../stores/data/pages'
	import { id as activePageID } from '../../../../stores/app/activePage'
	import { pages as actions } from '../../../../stores/actions'
	import { content_editable, validate_url } from '../../../../utilities'
	import PageForm from './PageForm.svelte'

	/** @type {import('../../../..').Page | null}*/
	export let parent = null

	/** @type {import('../../../..').Page}*/
	export let page
	export let children = []
	export let active

	let editing_page = false
	/** @type {string[]}*/
	export let parent_urls = []

	const site_url = window.location.pathname.split('/')[1]
	const full_url = parent
		? `/${site_url}/${parent_urls.join('/')}/${page.url}`
		: `/${site_url}/${page.url}`

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
</script>

<div class="page-item-container" class:active={page.id === $activePageID}>
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
				{#if page.url !== 'index'}
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
							{page.url}
						</div>
					</div>
				{/if}
			</div>
		{:else}
			<a class="details" class:active href={full_url} on:click={() => modal.hide()}>
				<span>{page.name}</span>
				<span class="url">/{page.url !== 'index' ? page.url : ''}</span>
			</a>
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
		<button
			class="edit"
			class:active={editing_page}
			title="Rename"
			on:click={() => (editing_page = !editing_page)}
		>
			<Icon icon="clarity:edit-solid" />
		</button>
		{#if page.url !== 'index'}
			<button title="Create Subpage" on:click={() => (creating_page = true)}>
				<Icon icon="akar-icons:plus" />
			</button>
			<button title="Delete Page" on:click={() => dispatch('delete', page)}>
				<Icon icon="fluent:delete-20-filled" />
			</button>
		{/if}
	</div>
</div>

{#if creating_page}
	<PageForm
		{page}
		on:create={({ detail: page }) => {
			creating_page = false
			dispatch('create', page)
		}}
	/>
{/if}

{#if showing_children && has_children}
	<ul class="page-list child" transition:slide|local={{ duration: 100 }}>
		{#each children as subpage}
			{@const subchildren = $pages.filter((p) => p.parent === subpage.id)}
			<li>
				<svelte:self
					parent={page}
					page={subpage}
					parent_urls={[...parent_urls, page.url]}
					children={subchildren}
					active={$activePageID === subpage.id}
					on:delete
					on:create
				/>
			</li>
		{/each}
	</ul>
{/if}

<style>
	.page-item-container {
		display: flex;
		justify-content: space-between;
		padding: 0.875rem 1.125rem;
		background: #1a1a1a;
	}

		.page-item-container.active {
			background: #222;
		}

		.page-item-container .left {
			display: flex;
			align-items: center;
			gap: 0.5rem;
		}

		.page-item-container .left .details {
				font-weight: 400;
				font-size: 1.125rem;
				line-height: 1.5rem;
				display: flex;
				gap: 1rem;
			}

		.page-item-container .left .details .url {
					display: flex;
					font-weight: 400;
					color: var(--color-gray-5);
				}

		.page-item-container .left .details div.name,
				.page-item-container .left .details div.url {
					color: var(--primo-color-brand);
				}

		.page-item-container .left .details div.name span, .page-item-container .left .details div.url span {
						color: var(--color-gray-5);
					}

		.page-item-container .left .details div.name:focus, .page-item-container .left .details div.url:focus {
						outline: none;
					}

		.page-item-container .left .toggle {
				padding: 0 0.5rem;
				transition: 0.1s color;
				font-size: 1.5rem;
			}

		.page-item-container .left .toggle:hover {
					color: var(--color-accent);
				}

		.page-item-container .left .toggle.active {
					transform: scaleY(-1);
				}

		.page-item-container .options {
			display: flex;
			gap: 0.5rem;
		}

		.page-item-container .options .edit.active {
				color: var(--primo-color-brand);
			}

	.slot {
		background: #1c1c1c;
		margin: 0 1rem;
	}

	ul.page-list {
		margin: 0 1rem 1rem 1rem;
		background: #323334;
		border-radius: var(--primo-border-radius);
	}

	ul.page-list li:not(:last-child) {
			/* border-bottom: 1px solid #222; */
		}</style>
