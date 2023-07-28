<script context="module">
	import { writable, get } from 'svelte/store'

	const leftPaneSize = writable(get(onMobile) ? '100%' : '50%')
	const rightPaneSize = writable('50%')
	const topPaneSize = writable(get(onMobile) ? '100%' : '50%')
	const bottomPaneSize = writable('50%')
	const orientation = writable('horizontal')
	const activeTab = writable(0)
</script>

<script>
	import { setContext } from 'svelte'
	import _, { cloneDeep, find, isEqual, chain as _chain } from 'lodash-es'
	import HSplitPane from './HSplitPane.svelte'
	import { getEmptyValue } from '../../../utils'
	import ModalHeader from '../ModalHeader.svelte'
	import { Tabs } from '../../../components/misc'
	import FullCodeEditor from './FullCodeEditor.svelte'
	import { CodePreview } from '../../../components/misc'
	import GenericFields from '../../../components/GenericFields.svelte'
	import { autoRefresh } from '../../../components/misc/CodePreview.svelte'

	import { processCode, processCSS, wrapInStyleTags } from '../../../utils'
	import { locale, onMobile } from '../../../stores/app/misc'

	import * as actions from '../../../stores/actions'
	import { content, code as siteCode } from '../../../stores/data/site'
	import { code as pageCode } from '../../../stores/app/activePage'
	import { showingIDE } from '../../../stores/app'
	import { getPageData } from '../../../stores/helpers'
	import { tick } from 'svelte'

	/** @type {import('$lib').Symbol} */
	export let symbol

	export let header = {
		label: 'Create Symbol',
		icon: 'fas fa-code',
		button: {
			icon: 'fas fa-plus',
			label: 'Add to page',
			onclick: (symbol) => {}
		}
	}

	// Show Static Field toggle within Field Item
	setContext('show_static_field', true)

	const placeholders = new Map()
	function getCachedPlaceholder(field) {
		const key = JSON.stringify(field)
		if (placeholders.has(key)) {
			return placeholders.get(key)
		} else {
			const val = getEmptyValue(field)
			placeholders.set(key, val)
			return val
		}
	}

	// local copy of component to modify & save
	let local_component = cloneDeep(symbol)

	let local_code = cloneDeep(symbol.code)

	// on-screen fields w/ values included
	let fields = cloneDeep(symbol.fields)

	// local copy of component content to modify & save
	let local_content = get_local_content()
	function get_local_content() {
		let final_content = {}
		fields.forEach((field) => {
			final_content = {
				...final_content,
				[$locale]: {
					...final_content[$locale],
					[field.key]: symbol.content[$locale][field.key] || getCachedPlaceholder(field)
				}
			}
		})
		return final_content
	}

	// component data for compiling
	$: data = get_data($locale, local_content)
	function get_data(loc, content) {
		return {
			...getPageData({ loc }), // pass in page data for page head
			...content[loc]
		}
	}

	// swap content out of on-screen fields when locale changes
	$: setupComponent($locale)
	function setupComponent(loc) {
		fields = getFieldValues(fields, loc)

		// hydrate fields with content
		function getFieldValues(fields, loc) {
			return fields.map((field) => {
				const field_value = local_content[loc]?.[field.key]
				const value = field_value !== undefined ? field_value : getCachedPlaceholder(field)
				return {
					...field,
					value
				}
			})
		}
	}

	// Ensure all content keys match field keys
	$: syncFieldKeys(fields)
	$: syncLocales($content)

	async function syncFieldKeys(fields) {
		const updated_local_content = _.cloneDeep(local_content)
		removeNonexistantKeys() // delete keys from content that do not appear in fields
		addMissingKeys() // add keys that do appear in fields
		local_content = updated_local_content

		// Remove content when field deleted
		function removeNonexistantKeys() {
			Object.keys(local_content[$locale]).forEach((key) => {
				if (!find(fields, ['key', key])) {
					Object.keys(local_content).forEach((loc) => {
						delete updated_local_content[loc][key]
					})
				}
			})
			refreshPreview()
		}

		function addMissingKeys() {
			fields.forEach((field) => {
				if (local_content[$locale][field.key] === undefined) {
					Object.keys(local_content).forEach((loc) => {
						updated_local_content[loc][field.key] = getEmptyValue(field)
					})
				}
			})
		}
	}

	function syncLocales(content) {
		// runs when adding new locale from ComponentEditor
		Object.keys(content).forEach((loc) => {
			if (!local_content[loc]) {
				local_content = {
					...local_content,
					[loc]: local_content['en']
				}
			}
		})
	}

	function save_local_content() {
		// TODO
		// save field value to all locales where block is used
		// when block gets added to page, add static value as content to locale
		local_content = {
			...local_content,
			[$locale]: {
				...local_content[$locale],
				..._chain(fields).keyBy('key').mapValues('value').value()
			}
		}
	}

	let loading = false

	// raw code bound to code editor
	let raw_html = local_code.html
	let raw_css = local_code.css
	let raw_js = local_code.js

	// changing codes triggers compilation
	$: $autoRefresh &&
		compileComponentCode({
			html: raw_html,
			css: raw_css,
			js: raw_js
		})

	let componentApp // holds compiled component
	let compilationError // holds compilation error

	$: compilationError && data && refreshPreview() // recompile when there's a compilation error & data changes

	// ensure placeholder values always conform to form
	// TODO: do for remaining fields
	$: fields = fields.map((field) => {
		if (field.type === 'link' && !field.value?.url)
			return {
				...field,
				value: getCachedPlaceholder(field)
			}
		else return field
	})

	let disableSave = false
	async function compileComponentCode({ html, css, js }) {
		disableSave = true
		loading = true

		await compile()
		disableSave = compilationError
		await setTimeout(() => {
			loading = false
		}, 200)

		async function compile() {
			const parentCSS = await processCSS($siteCode.css + $pageCode.css)
			const res = await processCode({
				component: {
					html: `
      <svelte:head>
        ${$siteCode.html.head}
        ${$pageCode.html.head}
        ${wrapInStyleTags(parentCSS, 'parent-styles')}
      </svelte:head>
      ${html}
      ${$pageCode.html.below}
      ${$siteCode.html.below}
      `,
					css,
					js,
					data
				},
				buildStatic: false
			})
			compilationError = res.error
			componentApp = res.js
			local_code = {
				html,
				css,
				js
			}
		}
	}

	const tabs = [
		{
			id: 'code',
			label: 'Code',
			icon: 'code'
		},
		{
			id: 'fields',
			label: 'Fields',
			icon: 'database'
		}
	]

	let previewUpToDate = false
	$: raw_html, raw_css, raw_js, (previewUpToDate = false) // reset when code changes

	async function refreshPreview() {
		await compileComponentCode({
			html: raw_html,
			css: raw_css,
			js: raw_js
		})
		previewUpToDate = true
	}

	async function saveComponent() {
		if (!previewUpToDate) {
			await refreshPreview()
		}

		if (!disableSave) {
			// parse content - static content gets saved to symbol, dynamic content gets saved to instance

			// code & fields gets saved to symbol
			actions.symbols.update({
				...symbol,
				code: local_code,
				content: local_content,
				fields
			})

			header.button.onclick()
		}
	}
</script>

<ModalHeader
	{...header}
	warn={() => {
		if (!isEqual(local_component, symbol)) {
			const proceed = window.confirm('Undrafted changes will be lost. Continue?')
			return proceed
		} else return true
	}}
	button={{
		...header.button,
		onclick: saveComponent,
		icon: 'material-symbols:save',
		disabled: disableSave
	}}
/>

<main class:showing-ide={$showingIDE} class:showing-cms={!$showingIDE}>
	<HSplitPane
		orientation={$orientation}
		bind:leftPaneSize={$leftPaneSize}
		bind:rightPaneSize={$rightPaneSize}
		bind:topPaneSize={$topPaneSize}
		bind:bottomPaneSize={$bottomPaneSize}
		hideRightPanel={$onMobile}
		hideLeftOverflow={$showingIDE && $activeTab === 0}
	>
		<div slot="left" lang={$locale}>
			{#if $showingIDE}
				<Tabs {tabs} bind:activeTab={$activeTab} />
				{#if $activeTab === 0}
					<FullCodeEditor
						bind:html={raw_html}
						bind:css={raw_css}
						bind:js={raw_js}
						{data}
						on:save={saveComponent}
						on:refresh={refreshPreview}
					/>
				{:else if $activeTab === 1}
					<GenericFields
						bind:fields
						on:input={() => {
							refreshPreview()
							save_local_content()
						}}
						on:delete={async () => {
							await tick() // wait for fields to update
							save_local_content()
							refreshPreview()
						}}
						showCode={true}
					/>
				{/if}
			{:else}
				<GenericFields
					bind:fields
					on:save={saveComponent}
					on:input={() => {
						fields = fields.filter(Boolean) // to trigger setting `data`
						save_local_content()
					}}
					showCode={false}
				/>
			{/if}
		</div>
		<div slot="right">
			<CodePreview
				bind:orientation={$orientation}
				view="small"
				{loading}
				{componentApp}
				{data}
				error={compilationError}
			/>
		</div>
	</HSplitPane>
</main>

<style lang="postcss">
	main {
		display: flex; /* to help w/ positioning child items in code view */
		background: var(--primo-color-black);
		color: var(--color-gray-2);
		padding: 0 0.5rem;
		flex: 1;
		overflow: hidden;

		--PrimaryButton-bg: var(--color-gray-8);
		--PrimaryButton-bg-hover: var(--color-gray-9);
	}

	[slot='right'] {
		width: 100%;
	}

	:global(.showing-cms [slot='left']) {
		height: 100% !important;
	}

	:global(.showing-cms .wrapper.vertical) {
		height: 100% !important;
	}

	[slot='left'] {
		/* height: calc(100% - 45px); */
		height: 100%;

		display: flex;
		flex-direction: column;
	}
</style>
