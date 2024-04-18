<script context="module">
	import { writable, get } from 'svelte/store'

	const leftPaneSize = writable(get(onMobile) ? '100%' : '50%')
	const rightPaneSize = writable('50%')
	const topPaneSize = writable(get(onMobile) ? '100%' : '50%')
	const bottomPaneSize = writable('50%')
	const orientation = writable('horizontal')
	const activeTab = writable('code')
</script>

<script>
	import _, { cloneDeep, find, chain as _chain } from 'lodash-es'
	import HSplitPane from './HSplitPane.svelte'
	import { getEmptyValue } from '../../../utils'
	import ModalHeader from '../ModalHeader.svelte'
	import Tabs from '../../../ui/Tabs.svelte'
	import FullCodeEditor from './FullCodeEditor.svelte'
	import { CodePreview } from '../../../components/misc'
	import GenericFields from '../../../components/GenericFields/GenericFields.svelte'
	import { autoRefresh } from '../../../components/misc/CodePreview.svelte'
	import { buildStaticPage } from '../../../stores/helpers'
	import { locale, onMobile, userRole } from '../../../stores/app/misc'
	import modal from '../../../stores/app/modal'
	import { active_page } from '../../../stores/actions'
	import activePage, {
		code as pageCode,
		fields as pageFields,
		content as pageContent
	} from '../../../stores/app/activePage'
	import { tick } from 'svelte'
	import { page } from '$app/stores'

	let local_code = cloneDeep($pageCode)
	let local_content = cloneDeep($pageContent)
	let local_fields = cloneDeep($pageFields).map((field) => ({
		...field,
		value: local_content[$locale][field.key]
	}))

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

	// component data w/ page/site data included (for compilation)
	$: data = {
		// ...getPageData({ loc: $locale }),
		...local_content[$locale]
	}

	$: setupComponent($locale) // swap content out of on-screen fields
	function setupComponent(loc) {
		fields = getFieldValues(fields, loc)
	}

	// hydrate fields with content (placeholder if passed component is a Symbol)
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

	// Ensure all content keys match field keys
	$: syncFieldKeys(fields)
	// $: syncLocales($content)

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

	function syncFieldKeys(fields) {
		removeNonexistantKeys() // delete keys from content that do not appear in fields
		addMissingKeys() // add keys that do appear in fields

		function addMissingKeys() {
			let updatedContent = cloneDeep(local_content)
			fields.forEach((field) => {
				if (local_content[$locale][field.key] === undefined) {
					Object.keys(local_content).forEach((loc) => {
						updatedContent[loc][field.key] = getEmptyValue(field)
					})
				}
			})
			local_content = updatedContent
		}

		// Remove content when field deleted
		function removeNonexistantKeys() {
			let updatedContent = cloneDeep(local_content)
			Object.keys(local_content[$locale]).forEach((key) => {
				if (!find(fields, ['key', key])) {
					Object.keys(local_content).forEach((loc) => {
						delete updatedContent[loc][key]
					})
				}
			})
			local_content = updatedContent
			refreshPreview()
		}
	}

	function saveLocalContent() {
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

	function saveLocalValue(property, value) {
		local_code[property] = value
	}

	let loading = false

	// bind raw code to code editor
	let rawHTML = local_code.html.head
	let rawCSS = local_code.css
	let rawJS = local_code.js

	// changing code triggers compilation
	$: $autoRefresh &&
		compileComponentCode({
			html: rawHTML,
			css: rawCSS,
			js: rawJS
		})

	// on-screen fields
	let fields = local_fields

	let preview = ''

	let compilationError // holds compilation error

	let disableSave = false
	async function compileComponentCode({ html, css, js }) {
		disableSave = true
		loading = true

		saveLocalValue('html', html)
		saveLocalValue('css', css)
		saveLocalValue('js', js)

		await compile()
		disableSave = compilationError
		await setTimeout(() => {
			loading = false
		}, 200)

		async function compile() {
			preview = (
				await buildStaticPage({
					page: {
						...$activePage,
						code: {
							...local_code,
							html: {
								head: html,
								below: '' // TODO
							}
						},
						content: local_content
					}
				})
			)?.html
		}
	}

	let previewUpToDate = false
	$: rawHTML, rawCSS, rawJS, (previewUpToDate = false) // reset when code changes

	async function refreshPreview() {
		await compileComponentCode({
			html: rawHTML,
			css: rawCSS,
			js: rawJS
		})
		previewUpToDate = true
	}

	async function saveComponent() {
		if (!previewUpToDate) {
			await refreshPreview()
		}

		const Final = {
			code: {
				...local_code,
				html: {
					head: local_code.html,
					below: ''
				}
			},
			content: local_content,
			fields: _.cloneDeep(fields).map((field) => {
				delete field.value
				return field
			})
		}

		if (!disableSave) {
			active_page.update({ obj: Final, is_page_type: !!$page.data.page_type })
			modal.hide()
		}
	}
</script>

<div class="PageEditor">
	{#if $userRole === 'DEV'}
		<ModalHeader
			warn={() => {
				return true
			}}
			button={{
				icon: 'material-symbols:save',
				label: 'Save',
				onclick: saveComponent,
				disabled: disableSave
			}}
		>
			<div slot="title">
				<Tabs
					tabs={[
						{
							id: 'code',
							label: 'Code',
							icon: 'gravity-ui:code'
						},
						{
							id: 'fields',
							label: 'Fields',
							icon: 'fluent:form-multiple-24-regular'
						},
						{
							id: 'content',
							label: 'Content',
							icon: 'uil:edit'
						}
					]}
					bind:active_tab_id={$activeTab}
				/>
			</div>
		</ModalHeader>
	{:else}
		<ModalHeader
			title="Page"
			warn={() => {
				// if (!isEqual(local_component, component)) {
				//   const proceed = window.confirm(
				//     'Undrafted changes will be lost. Continue?'
				//   )
				//   return proceed
				// } else return true
				return true
			}}
			button={{
				icon: 'material-symbols:save',
				label: 'Save',
				onclick: saveComponent,
				disabled: disableSave
			}}
		/>
	{/if}

	<main>
		{#if $activeTab === 'fields'}
			<GenericFields
				bind:fields
				on:input={() => {
					refreshPreview()
					saveLocalContent()
				}}
				on:delete={async () => {
					await tick() // wait for fields to update
					saveLocalContent()
					refreshPreview()
				}}
				showCode={true}
			/>
		{:else}
			<HSplitPane
				orientation={$orientation}
				bind:leftPaneSize={$leftPaneSize}
				bind:rightPaneSize={$rightPaneSize}
				bind:topPaneSize={$topPaneSize}
				bind:bottomPaneSize={$bottomPaneSize}
				hideRightPanel={$onMobile}
			>
				<div slot="left" lang={$locale}>
					{#if $activeTab === 'code'}
						<FullCodeEditor
							bind:html={rawHTML}
							bind:css={rawCSS}
							{data}
							on:save={saveComponent}
							on:refresh={refreshPreview}
						/>
					{:else if $activeTab === 'content'}
						<GenericFields
							bind:fields
							on:save={saveComponent}
							on:input={() => {
								fields = fields.filter(Boolean) // to trigger setting `data`
								saveLocalContent()
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
						{preview}
						error={compilationError}
					/>
				</div>
			</HSplitPane>
		{/if}
	</main>
</div>

<style lang="postcss">
	.PageEditor {
		flex: 1;
		display: flex;
		flex-direction: column;
	}
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

	/* not sure if still needed */
	/* :global(.showing-cms [slot='left']) {
		height: 100% !important;
	}

	:global(.showing-cms .wrapper.vertical) {
		height: 100% !important;
	} */

	[slot='left'] {
		/* height: calc(100% - 45px); */
		height: 100%;

		display: flex;
		flex-direction: column;
	}
</style>
