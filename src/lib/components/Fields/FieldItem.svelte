<script>
	import _, { cloneDeep, chain as _chain } from 'lodash-es'
	import autosize from 'autosize'
	import { showKeyHint } from '../../stores/app/misc'
	import UI from '../../ui/index.js'
	import Icon from '@iconify/svelte'
	import Condition from './Condition.svelte'
	import SyncField from './SyncField.svelte'
	import SelectField from './SelectField.svelte'
	import fieldTypes from '../../stores/app/fieldTypes.js'
	import { pluralize } from '../../field-types/RepeaterField.svelte'

	import { createEventDispatcher } from 'svelte'
	const dispatch = createEventDispatcher()

	export let field
	export let fields
	export let level = 0
	export let top_level = true
	export let autofocus = false

	function update_field_label({ detail: label }) {
		dispatch_update({
			type: field_type_changed ? field.type : update_field_type(label)
			// key: key_edited ? field.key : validateFieldKey(label)
		})
	}

	function validateFieldKey(key) {
		// replace dash and space with underscore
		return key.replace(/-/g, '_').replace(/ /g, '_').toLowerCase()
	}

	function dispatch_update(updated_props) {
		const updated_field = cloneDeep({ ...field, ...updated_props })
		dispatch('input', updated_field)
	}

	// Auto-fill key when setting label
	let key_edited = false

	// autosize info textarea
	let info_textarea
	$: if (info_textarea) {
		autosize(info_textarea)
	}

	let width
	$: collapsed = width < 400
	$: minimal = field.type === 'info'
	$: has_subfields = field.type === 'group' || field.type === 'repeater'
	$: has_condition = field.options.condition

	$: selected_field_type_id = $fieldTypes.find((ft) => ft.id === field.type)['id']

	// auto-match field-type to entered label (e.g. [Plural], Icon, Image, Link)
	let field_type_changed = false // but don't overwrite it if the user's already entered it
	function update_field_type(label) {
		label = label.toLowerCase()
		if (label && $pluralize.isPlural(label)) {
			console.log('PLURAL', label)
			return 'repeater'
		} else if (label.includes('icon')) {
			return 'icon'
		} else if (label.includes('image')) {
			return 'image'
		} else if (label.includes('link')) {
			return 'link'
		} else if (label.includes('type')) {
			return 'select'
		} else if (label.includes('group')) {
			return 'group'
		} else return 'text'
		// dispatch_update({ type: selected_field_type_id })
	}

	$: child_fields = fields.filter((f) => f.parent === field.id)
</script>

<div class="top-container" class:top_level class:collapsed>
	<div class="field-container" class:minimal bind:clientWidth={width}>
		<div class="type column-container">
			<UI.Select
				label="Type"
				value={selected_field_type_id}
				options={$fieldTypes.map((ft) => ({ icon: ft.icon, value: ft.id, label: ft.label }))}
				dividers={[1, 8, 12]}
				on:input={({ detail: field_type_id }) => {
					field_type_changed = true
					selected_field_type_id = field_type_id
					// field.type = field_type_id
					dispatch_update({
						type: field_type_id
					})
				}}
				placement="bottom-start"
			/>
		</div>
		{#if minimal}
			<!-- Just for info field for now -->
			<div class="main column-container">
				<UI.TextInput
					label="Information"
					value={field.options.info || ''}
					autogrow={true}
					placeholder="Something important about the following fields..."
					on:input={({ target }) => {
						// field.options.info = target.value
						dispatch_update({
							options: {
								...field.options,
								info: target.value
							}
						})
					}}
				/>
			</div>
		{:else}
			<!-- svelte-ignore a11y-label-has-associated-control -->
			<div class="column-container">
				<UI.TextInput
					label="Label ({field.id})"
					bind:value={field.label}
					placeholder="Heading"
					{autofocus}
					on:input={({ detail }) => {
						console.log({ detail })
						dispatch_update({
							type: field_type_changed ? field.type : update_field_type(detail),
							key: key_edited ? field.key : validateFieldKey(detail)
						})
					}}
				/>
			</div>
			<!-- svelte-ignore a11y-label-has-associated-control -->
			<div class="field column-container">
				<UI.TextInput
					label="Key"
					placeholder="heading"
					value={field.key}
					on:input={({ detail: value }) => {
						key_edited = true
						// field.key = validateFieldKey(value)
						dispatch_update({
							key: validateFieldKey(value)
						})
					}}
				/>
			</div>
		{/if}
		<div class="field-options">
			{#if $showKeyHint}
				<button class="delete" on:click={() => dispatch('delete', field)}>
					<Icon icon="ic:outline-delete" />
				</button>
			{:else}
				<UI.Dropdown
					variant="large-button"
					options={[
						{
							label: 'Move up',
							icon: 'material-symbols:arrow-circle-up-outline',
							on_click: () => dispatch('move', { direction: 'up', field })
						},
						{
							label: 'Move down',
							icon: 'material-symbols:arrow-circle-down-outline',
							on_click: () => dispatch('move', { direction: 'down', field })
						},
						...(has_condition || !top_level
							? []
							: [
									{
										label: 'Add Condition',
										icon: 'mdi:show',
										on_click: () => {
											// field.options.condition = {
											// 	field: null,
											// 	comparison: '=',
											// 	value: ''
											// }
											dispatch_update({
												options: {
													...field.options,
													condition: {
														field: null,
														comparison: '=',
														value: ''
													}
												}
											})
										}
									}
							  ]),
						{
							label: 'Sync Field Value', // or 'Mirror Content Value'
							icon: 'fluent-mdl2:dependency-add',
							on_click: () => {
								console.log('sync')
								// add 'source' to field row
								dispatch_update()
							}
						},
						{
							label: 'Duplicate',
							icon: 'bxs:duplicate',
							on_click: () => dispatch('duplicate', field)
						},
						{
							label: 'Delete',
							icon: 'ic:outline-delete',
							color: 'var(--primo-color-danger)',
							on_click: () => dispatch('delete', field)
						}
					]}
					placement="bottom-end"
				/>
			{/if}
		</div>
	</div>
	{#if has_subfields}
		<div class="children-container" style:padding-left="{level + 1}rem">
			{#each child_fields.sort((a, b) => a.index - b.index) as subfield (subfield.id)}
				<svelte:self
					field={cloneDeep(subfield)}
					{fields}
					top_level={false}
					level={level + 1}
					autofocus={subfield.label === ''}
					on:duplicate
					on:delete
					on:move
					on:createsubfield
					on:input
				/>
			{/each}
			{#if field.type === 'repeater' || field.type === 'group'}
				<button
					class="subfield-button"
					data-level={level}
					on:click={() => dispatch('createsubfield', field)}
				>
					<Icon icon="fa-solid:plus" />
					<span>Create {field.label} Subfield</span>
				</button>
			{/if}
		</div>
	{/if}
	<div class="footer" class:hidden={field.type !== 'select' && !field.options.condition}>
		{#if field.type === 'select'}
			<SelectField
				{field}
				{level}
				on:input={({ detail: updated_field }) => {
					console.log({ updated_field })
					dispatch_update(updated_field)
				}}
			/>
		{/if}
		{#if field.options.condition}
			<Condition
				{field}
				field_to_compare={fields.find((f) => f.id === field.options.condition.field)}
				comparable_fields={fields?.filter(
					(f) => ['text', 'number', 'switch', 'url', 'select'].includes(f.type) && f.id !== field.id
				)}
				{collapsed}
				on:input={({ detail }) => {
					console.log({ detail })
				}}
			/>
		{/if}
		{#if field.options.sync}
			<SyncField
				{field}
				field_to_compare={fields.find((f) => f.id === field.options.condition.field)}
				comparable_fields={fields?.filter(
					(f) => ['text', 'number', 'switch', 'url', 'select'].includes(f.type) && f.id !== field.id
				)}
				on:input={({ detail }) => {
					console.log({ detail })
				}}
			/>
		{/if}
	</div>
</div>

<style lang="postcss">
	.hidden {
		display: none;
	}
	.top-container {
		display: grid;
		gap: 1.5rem;
		position: relative;

		&.top_level {
			background-color: #1a1a1a;
			border-radius: 6px;
			padding: 24px 24px;
		}

		&.collapsed {
			padding: 1rem;

			.field-container {
				grid-template-columns: 1fr !important;
				gap: 0.75rem;
			}
		}
	}
	.field-options {
		margin-top: 1rem; /* line up with inputs */

		button.delete {
			font-size: 15px;
			padding: 0.5rem;
			border-radius: 0.25rem;
			color: var(--primo-color-danger);

			&:hover {
				background: var(--color-gray-8);
			}
		}
	}
	.subfield-button {
		width: 100%;
		border-radius: 0.25rem;
		/* margin-top: 10px; */
		padding: 0.5rem 1rem;
		font-size: var(--font-size-2);
		/* background: #1f1f1f; */
		background: #292929;
		color: var(--button-color);
		/* background-color: #292929; */
		/* color: var(--color-gray-2); */
		transition: var(--transition-colors);
		outline: 0;
		display: block;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		border: 1px solid transparent;

		&:hover {
			/* background: #333333; */
			background: #292929;
		}

		&:focus-visible {
			border-color: var(--primo-color-brand);
			outline: 0;
		}

		/* &:hover,
		&:focus-visible {
			border-color: var(--primo-color-brand);
			outline: 0;
		} */

		/* &:hover {
			background: #333333;
		}
		&:focus {
			border-color: var(--primo-color-brand);
			outline: 0;
		} */
	}

	.children-container {
		display: grid;
		gap: 1.5rem;
		/* margin: 1rem 0; */
		border-color: var(--color-gray-8);
	}

	.column-container {
		display: flex;
		flex-direction: column;
		flex: 1;
	}

	.field-container {
		display: grid;
		grid-template-columns: 1fr 3fr 3fr auto;
		gap: 0.5rem;
		place-items: start normal;

		&.collapsed .minimal {
			.main {
				grid-column: 1 / span 2;
			}
		}

		.type {
			border-radius: 1px;
			display: flex;
			min-width: 3rem;
		}

		&.minimal {
			grid-template-columns: auto 1fr auto;
		}
	}
</style>
