<script context="module">
	import { writable, get } from 'svelte/store'

	const leftPaneSize = writable(get(onMobile) ? '100%' : '50%')
	const rightPaneSize = writable('50%')
	const topPaneSize = writable(get(onMobile) ? '100%' : '50%')
	const bottomPaneSize = writable('50%')
	const orientation = writable('horizontal')
</script>

<script>
	import Tabs from '../../../ui/Tabs.svelte'
	import { setContext } from 'svelte'
	import _, { chain as _chain } from 'lodash-es'
	import HSplitPane from './HSplitPane.svelte'
	import ModalHeader from '../ModalHeader.svelte'
	import FullCodeEditor from './FullCodeEditor.svelte'
	import { CodePreview } from '../../../components/misc/index.js'
	import Fields from '../../../components/Fields/Fields.svelte'
	import Content from '../../../components/Content.svelte'
	import { autoRefresh } from '../../../components/misc/CodePreview.svelte'
	import { processCode } from '../../../utils.js'
	import { locale, onMobile, userRole } from '../../../stores/app/misc.js'

	import { site_design_css } from '../../../code_generators.js'
	import symbols from '../../../stores/data/symbols.js'
	import * as actions from '../../../stores/actions.js'
	import { content, design as siteDesign, code as siteCode } from '../../../stores/data/site.js'
	import { Content_Row } from '../../../factories.js'
	import { transform_content } from '../../../transform_data.js'

	/** @type {import('$lib').Section} */
	export let component
	export let tab = 'content'

	export let header = {
		label: 'Create Component',
		icon: 'fas fa-code',
		button: {
			icon: 'fas fa-plus',
			label: 'Add to page',
			onclick: (component) => {
				console.warn('Component not going anywhere', component)
			}
		}
	}

	const symbol = _.cloneDeep($symbols.find((s) => s.id === component.symbol))

	let local_fields = _.cloneDeep(symbol.fields)
	let local_content = _.cloneDeep(component.content)

	// Show Static Field toggle within Field Item
	setContext('show_static_field', true)

	let loading = false

	// raw code bound to code editor
	let local_code = _.cloneDeep(symbol.code)
	let raw_html = local_code.html
	let raw_css = local_code.css
	let raw_js = local_code.js

	$: component_data = transform_content({ fields: local_fields, content: local_content })[$locale]
	$: console.log({ component_data })

	// changing codes triggers compilation
	$: $autoRefresh &&
		compile_component_code({
			html: raw_html,
			css: raw_css,
			js: raw_js
		})

	let componentApp // holds compiled component
	let compilationError // holds compilation error

	$: compilationError && component_data && refresh_preview() // recompile when there's a compilation error or data changes

	let disable_save = false
	async function compile_component_code({ html, css, js }) {
		disable_save = true
		loading = true

		await compile()
		disable_save = compilationError
		await setTimeout(() => {
			loading = false
		}, 200)

		async function compile() {
			// const parentCSS = await processCSS($siteCode.css + $pageCode.css)
			const res = await processCode({
				component: {
					html:
						html +
						$siteCode.foot +
						`
					 <svelte:head>
						 ${$siteCode.head}
						 ${site_design_css($siteDesign)}
					 </svelte:head>`,
					css,
					js,
					data: component_data
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

	let previewUpToDate = false
	$: raw_html, raw_css, raw_js, (previewUpToDate = false) // reset when code changes

	async function refresh_preview() {
		await compile_component_code({
			html: raw_html,
			css: raw_css,
			js: raw_js
		})
		previewUpToDate = true
	}

	async function save_component() {
		if (!previewUpToDate) {
			await refresh_preview()
		}

		if (!disable_save) {
			// code & fields gets saved to symbol
			actions.symbols.update(symbol.id, {
				code: local_code
				// content: updated_symbol_content,
				// fields: fields.map((field) => {
				// 	delete field.value
				// 	return field
				// })
			})

			// non-static content gets saved to section
			console.log({
				component,
				local_content,
				field_transactions,
				content_transactions,
				local_fields
			})

			// TODO pass new content items for symbol for newly created fields
			actions.update_instance(component.id, {
				field_transactions,
				content_transactions,
				updated_fields: local_fields,
				updated_content: local_content
			})

			header.button.onclick()
		}
	}

	let field_transactions = []
	let content_transactions = []
	function handle_field_transaction(transaction) {
		const existing_content_transaction = content_transactions.find(
			(t) => t.data.field === transaction.id
		)
		if (transaction.action === 'insert') {
			const new_content_row = Content_Row({ field: transaction.id, locale: $locale })
			local_content = [...local_content, new_content_row]
			content_transactions = [
				...content_transactions,
				{ action: 'insert', id: new_content_row.id, data: new_content_row }
			]
		} else if (transaction.action === 'delete') {
			if (existing_content_transaction.action === 'insert') {
				content_transactions = content_transactions.filter(
					(t) => t.data.field !== existing_content_transaction.data.field
				)
			} else {
				const existing_content_row = content.find((r) => r.field === transaction.id)
				content_transactions = [
					...content_transactions,
					{ action: 'delete', id: existing_content_row.id }
				]
			}
			local_content = local_content.filter((r) => r.field === transaction.id)
		}
		field_transactions = transaction.all
	}

	function handle_content_transaction({ id, data }) {
		const existing_transaction = content_transactions.find((t) => t.id === id)
		if (existing_transaction) {
			existing_transaction.data = { ...existing_transaction.data, ...data }
		} else {
			content_transactions = [...content_transactions, { action: 'update', id, data }]
		}
	}
</script>

{#if $userRole === 'DEV'}
	<ModalHeader
		{...header}
		warn={() => {
			const component_changed = true
			// !isEqual(local_content, get_local_content()) || !isEqual(local_code, symbol.code)
			if (component_changed) {
				const proceed = window.confirm('Undrafted changes will be lost. Continue?')
				return proceed
			} else return true
		}}
		button={{
			...header.button,
			onclick: save_component,
			icon: 'material-symbols:save',
			disabled: disable_save
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
				bind:active_tab_id={tab}
			/>
		</div>
	</ModalHeader>
{:else}
	<ModalHeader
		{...header}
		warn={() => {
			const component_changed = true
			// !isEqual(local_content, get_local_content()) || !isEqual(local_code, symbol.code)
			if (component_changed) {
				const proceed = window.confirm('Undrafted changes will be lost. Continue?')
				return proceed
			} else return true
		}}
		title="Edit {component.symbol.name || 'Block'}"
		button={{
			...header.button,
			onclick: save_component,
			icon: 'material-symbols:save',
			disabled: disable_save
		}}
	/>
{/if}

<main class:showing-fields={tab === 'fields'} lang={$locale}>
	{#if tab === 'fields'}
		<Fields
			fields={local_fields}
			on:input={({ detail: updated_fields }) => (local_fields = updated_fields)}
			on:transaction={({ detail }) => handle_field_transaction(detail)}
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
			<div slot="left" style="display: flex; flex-direction: column">
				{#if tab === 'content'}
					<Content
						fields={local_fields}
						content={local_content}
						on:save={save_component}
						on:input={({ detail: updated_content }) => (local_content = updated_content)}
						on:transaction={({ detail }) => handle_content_transaction(detail)}
					/>
				{:else if tab === 'code'}
					<FullCodeEditor
						bind:html={raw_html}
						bind:css={raw_css}
						bind:js={raw_js}
						data={component_data}
						on:save={save_component}
						on:refresh={refresh_preview}
					/>
				{/if}
			</div>
			<div slot="right">
				<CodePreview
					bind:orientation={$orientation}
					view="small"
					{loading}
					{componentApp}
					data={component_data}
					error={compilationError}
				/>
			</div>
		</HSplitPane>
	{/if}
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
