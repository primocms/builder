<script>
	import _ from 'lodash-es'
	import Icon from '@iconify/svelte'
	import UI from '../ui'
	import pages from '../stores/data/pages'
	import { locale } from '../stores/app'
	import { createEventDispatcher } from 'svelte'
	const dispatch = createEventDispatcher()

	const default_value = {
		label: '',
		url: '',
		active: false
	}

	export let field
	export let value

	if (!value || typeof value === 'string' || !value.label) {
		value = _.cloneDeep(default_value)
	}

	let selected = urlMatchesPage(value.url)

	function urlMatchesPage(url) {
		if (url && url.startsWith('/')) {
			return 'page'
		} else {
			return 'url'
		}
	}

	$: selected_page_url = get_page_url($pages[0])
	$: console.log({ selected_page_url, $pages })
	function get_page_url(page) {
		const prefix = $locale === 'en' ? '/' : `/${$locale}/`
		if (page.slug === '') {
			return prefix
		} else {
			let parent_urls = []
			if (page.parent) {
				let no_more_parents = false
				let grandparent = $pages.find((p) => p.id === page.parent)
				parent_urls.push(grandparent.slug)
				while (!no_more_parents) {
					grandparent = $pages.find((p) => p.id === grandparent.parent)
					if (!grandparent) {
						no_more_parents = true
					} else {
						parent_urls.unshift(grandparent.slug)
					}
				}
			}
			return parent_urls.length
				? prefix + parent_urls.join('/') + '/' + page.slug
				: prefix + page.slug
		}
	}

	console.log({ value })

	function get_page_name(url) {
		const home_page = $pages.find((p) => p.slug === '')?.name
		if (url === '/') {
			return home_page.name
		} else {
			const url_parts = url.slice(1).split('/')
			const page_url = url_parts[url_parts.length - 1]
			return $pages.find((p) => p.url === page_url)?.name || home_page.name
		}
	}

	function dispatch_update({ label = value.label, url = value.url }) {
		dispatch('input', { value: { label, url } })
	}

	// auto-set link from page name
	let page_name_edited = !!value.label
</script>

<div class="Link">
	<div class="inputs">
		<UI.TextInput
			label={field.label}
			on:input={({ detail }) => {
				console.log('edited')
				page_name_edited = true
				dispatch_update({
					label: detail
				})
			}}
			value={value.label}
			id="page-label"
			placeholder="About Us"
		/>
		<div class="url-select">
			<div class="toggle">
				<button class:active={selected === 'page'} on:click={() => (selected = 'page')}>
					<Icon icon="fluent:document-one-page-multiple-20-filled" />
					<span>Page</span>
				</button>
				<button class:active={selected === 'url'} on:click={() => (selected = 'url')}>
					<Icon icon="akar-icons:link-chain" />
					<span>URL</span>
				</button>
			</div>
			{#if selected === 'page'}
				{@const top_level_pages = $pages.filter((p) => !p.parent)}
				<UI.Select
					value={selected_page_url}
					options={top_level_pages.map((page) => ({
						label: page.name,
						value: get_page_url(page),
						suboptions: $pages
							.filter((p) => p.parent === page.id)
							.map((p) => ({ value: get_page_url(p), label: p.name }))
					}))}
					on:input={({ detail }) => {
						selected_page_url = detail
						console.log({ page_name_edited, detail, new_page_name: get_page_name(detail) })
						dispatch_update({
							url: detail,
							label: page_name_edited ? value.label : get_page_name(detail)
						})
					}}
				/>
			{:else}
				<UI.TextInput
					on:input={({ detail }) =>
						dispatch_update({
							url: detail
						})}
					value={value.url}
					type="url"
					placeholder="https://primocms.org"
				/>
			{/if}
		</div>
	</div>
</div>
<slot />

<style lang="postcss">
	.Link {
		display: flex;
		flex-direction: column;
	}

	.toggle {
		display: flex;
		background: var(--color-gray-9);
		border: 1px solid var(--color-gray-8);
		padding: 2px;
		border-radius: var(--primo-border-radius);
		--Dropdown-font-size: 0.875rem;

		button {
			border-radius: var(--primo-border-radius);
			font-size: 0.875rem;
			flex: 1;
			background: var(--color-gray-8);
			color: #8a8c8e;
			padding: 0.25rem 0.5rem;
			font-weight: 500;
			display: flex;
			align-items: center;
			justify-content: center;
			gap: 0.5rem;
			transition: 0.1s;
			background: transparent;

			&:focus,
			&.active {
				color: white;
				background: var(--color-gray-8);
				z-index: 1;
			}
		}
	}

	.inputs {
		display: grid;
		gap: 0.5rem;
		width: 100%;

		.url-select {
			display: flex;
			gap: 0.25rem;
			flex-wrap: wrap;
		}
	}
</style>
