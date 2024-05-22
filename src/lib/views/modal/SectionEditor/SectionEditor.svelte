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
	import { processCode, getEmptyValue } from '../../../utils.js'
	import { locale, onMobile, userRole } from '../../../stores/app/misc.js'
	import { site_design_css } from '../../../code_generators.js'
	import symbols from '../../../stores/data/symbols.js'
	import * as actions from '../../../stores/actions.js'
	import { design as siteDesign, code as siteCode } from '../../../stores/data/site.js'
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

	let local_code = _.cloneDeep(symbol.code)
	let local_fields = _.cloneDeep(symbol.fields)
	let local_content = _.cloneDeep(component.content)

	// Show Static Field toggle within Field Item
	setContext('show_static_field', true)

	let loading = false

	// raw code bound to code editor
	let raw_html = local_code.html
	let raw_css = local_code.css
	let raw_js = local_code.js

	$: console.log({ local_fields, local_content })
	// TODO: add empty content when field exists but not content (to prevent error when creating field before filling out content)
	$: component_data = transform_content({ fields: local_fields, content: local_content })[$locale]

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

	let field_transactions = []
	let content_transactions = []
	function handle_field_changes(transaction) {
		if (transaction.action === 'insert') {
			// NEXT: SectionEditor and BlockEditor can pass the updates/changes to Content.svelte, PageTypeSidebar and PageSidebar can pass them to the action for local/db update
			// const new_content_row = Content_Row({
			// 	field: transaction.data.id,
			// 	locale: $locale,
			// 	value: getEmptyValue(transaction.data)
			// })
			// local_content = [...local_content, new_content_row]
			// content_transactions = [
			// 	...content_transactions,
			// 	{ action: 'insert', id: new_content_row.id, data: new_content_row }
			// ]
		} else if (transaction.action === 'delete') {
			// so that we don't create content for fields that don't exist
			// could Content.svelte take care of this?
			content_transactions = content_transactions.filter((t) => t.data.field !== transaction.id)
			// TODO: delete descendent transactions too

			function get_ancestors(field) {
				const parent = local_fields.find((f) => f.id === field.parent)
				return parent ? [parent.id, ...get_ancestors(parent)] : []
			}

			// remove related content rows to not error out transform_content (maybe TODO: handle it in transform_content, just don't return it)
			// could Content.svelte take care of this?
			local_content = local_content.filter((row) => {
				const parent_row = local_content.find((r) => r.id === row.parent)

				const parent_is_repeater_item = parent_row?.index
				const parent_is_repeater_container = parent_row?.field

				let field
				if (!parent_is_repeater_item && !parent_is_repeater_container) {
					field = local_fields.find((f) => f.id === row.field)
				} else if (parent_is_repeater_item) {
					const grandparent_container = local_content.find((r) => r.id === parent_row.parent)
					field = local_fields.find((f) => f.id === grandparent_container.field)
				} else if (parent_is_repeater_container) {
					field = local_fields.find((f) => f.id === parent_row.field)
				}

				console.log(row.id, {
					field,
					row,
					parent_row,
					parent_is_repeater_item,
					parent_is_repeater_container
				})

				// console.log({ field, row, local_content, parent_repeater_container })
				// root-level & not a match
				if (!field.parent && field.id !== transaction.id) {
					return true
				}

				// field matches
				if (field.id === transaction.id) {
					console.log('match, deleting', { field, row })
					return false
				}

				// is descendent of field
				const ancestors = get_ancestors(field)
				console.log({ ancestors })
				if (ancestors.includes(transaction.id)) {
					console.log('ancestors includes', { field, row })
					return false
				}

				return true
			})
			console.log({ local_content })
		}
	}

	async function save_component() {
		if (!previewUpToDate) {
			await refresh_preview()
		}

		if (!disable_save) {
			// TODO pass new content items for symbol for newly created fields
			actions.update_section(component.id, {
				field_transactions,
				content_transactions,
				updated_code: local_code,
				updated_fields: local_fields,
				updated_content: local_content
			})

			header.button.onclick()
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
			on:input={({ detail }) => {
				// modify content first to pass clean data to transform_content
				detail.changes.forEach((change) => handle_field_changes(change))

				local_fields = detail.fields
				console.log({ detail, local_content })
				field_transactions = detail.all_changes
			}}
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
						transactions={content_transactions}
						on:save={save_component}
						on:input={({ detail }) => {
							console.log({ detail })
							local_content = detail.content
							content_transactions = detail.all_changes
							// detail.changes.forEach((change) => handle_content_transaction(change))
						}}
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
