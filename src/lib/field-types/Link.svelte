<script>
	import { dataChanged } from '$lib/database'
	import Icon from '@iconify/svelte'
	import UI from '$lib/ui'
	import pages from '$lib/stores/data/pages'
	import { locale } from '$lib/stores/app/misc'
	import { createEventDispatcher } from 'svelte'
	const dispatch = createEventDispatcher()

	const link = {
		label: '',
		url: '',
		active: false
	}

	export let field = {
		value: link
	}

	if (!field.value || !field.value.label) {
		field.value = link
	}

	$: if (typeof field.value === 'string' || !field.value) {
		field.value = {
			label: '',
			url: '',
			active: false
		}
	} else if (field.value.title && !field.value.label) {
		// Fix old values using `title` instead of `label`
		field.value = {
			...field.value,
			label: field.value.title
		}
	}

	let selected = urlMatchesPage(field.value.url)

	function urlMatchesPage(url) {
		if (url && url.startsWith('/')) {
			return 'page'
		} else {
			return 'url'
		}
	}

	function getPageUrl(page, loc, pages) {
		const prefix = loc === 'en' ? '/' : `/${loc}/`
		if (page.url === 'index') {
			return prefix
		} else {
			let parent_urls = []
			if (page.parent) {
				let no_more_parents = false
				let grandparent = pages.find((p) => p.id === page.parent)
				parent_urls.push(grandparent.url)
				while (!no_more_parents) {
					grandparent = pages.find((p) => p.id === grandparent.parent)
					if (!grandparent) {
						no_more_parents = true
					} else {
						parent_urls.unshift(grandparent.url)
					}
				}
			}
			return parent_urls.length
				? prefix + parent_urls.join('/') + '/' + page.url
				: prefix + page.url
		}
	}

	$: selected_page_name = get_page_name(field.value.url)
	function get_page_name(url) {
		if (url === '/') {
			return $pages.find((p) => p.url === 'index')?.name
		} else {
			const url_parts = url.slice(1).split('/')
			const page_url = url_parts[url_parts.length - 1]
			console.log({ url_parts, page_url, $pages })
			return $pages.find((p) => p.url === page_url)?.name
		}
	}
	$: console.log({ selected_page_name })

	let page_name_edited = !!field.value.label
</script>

<div class="Link">
	<span class="label">{field.label}</span>
	<div class="inputs">
		<UI.TextInput
			on:input={() => {
				page_name_edited = true
				dispatch('input', field)
			}}
			bind:value={field.value.label}
			id="page-label"
			label="Label"
			placeholder="About Us"
		/>
		<div class="url-select">
			<div class="toggle">
				<button
					class:active={selected === 'page'}
					on:click={() => {
						selected = 'page'
					}}
				>
					<Icon icon="fluent:document-one-page-multiple-20-filled" />
					<span>Page</span>
				</button>
				<button
					class:active={selected === 'url'}
					on:click={() => {
						selected = 'url'
					}}
				>
					<Icon icon="akar-icons:link-chain" />
					<span>URL</span>
				</button>
			</div>
			{#if selected === 'page'}
				{@const top_level_pages = $pages.filter((p) => !p.parent)}
				<UI.Dropdown
					label={selected_page_name || 'Select Page'}
					options={top_level_pages.map((page) => ({
						label: page.name,
						value: getPageUrl(page, $locale, $pages),
						submenu: {
							title: page.name,
							options: $pages
								.filter((p) => p.parent === page.id)
								.map((p) => ({ value: getPageUrl(p, $locale, $pages), label: p.name }))
						}
					}))}
					on:input={({ detail: value }) => {
						if (!page_name_edited) {
							field.value.label = get_page_name(value)
						}
						field.value.url = value
						dispatch('input')
					}}
				/>
			{:else}
				<UI.TextInput
					on:input={() => dispatch('input', field)}
					bind:value={field.value.url}
					type="url"
					placeholder="https://primocms.org"
				/>
			{/if}
		</div>
	</div>
</div>
<slot />

<style lang="postcss">
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
			padding-inline: 0.5rem;
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

	.Link {
		display: flex;
		flex-direction: column;
	}

	span.label {
		font-size: var(--title-font-size, 1rem);
		font-weight: var(--title-font-weight, 700);
		padding-bottom: 1rem;
		letter-spacing: 1px;
	}

	.inputs {
		display: grid;
		gap: 0.5rem;
		width: 100%;

		.url-select {
			display: flex;
			gap: 0.25rem;
		}
	}
</style>
