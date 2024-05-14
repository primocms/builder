<script>
	import _, { cloneDeep, chain as _chain } from 'lodash-es'
	import { getContext } from 'svelte'
	import autosize from 'autosize'
	import UI from '../../ui/index.js'
	import Toggle from 'svelte-toggle'
	import Condition from './Condition.svelte'
	import SyncField from './SyncField.svelte'
	import SelectField from './SelectField.svelte'
	import fieldTypes from '../../stores/app/fieldTypes.js'

	import { createEventDispatcher } from 'svelte'
	const dispatch = createEventDispatcher()

	export let field
	export let fields
	export let child_fields = []
	export let level = 0
	export let top_level = true

	function validateFieldKey(key) {
		// replace dash and space with underscore
		return key.replace(/-/g, '_').replace(/ /g, '_').toLowerCase()
	}

	function dispatchUpdate() {
		const updated_field = cloneDeep(field)
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
</script>

<div class="top-container" class:top_level class:collapsed>
	<div class="field-container" class:minimal bind:clientWidth={width}>
		<div class="type column-container">
			<span>Type</span>
			<UI.Dropdown
				icon={$fieldTypes.find((ft) => ft.id === field.type)?.icon}
				label={$fieldTypes.find((ft) => ft.id === field.type)?.label}
				options={$fieldTypes.map((ft) => ({ icon: ft.icon, value: ft.id, label: ft.label }))}
				dividers={[1, 8, 12]}
				on:input={({ detail: field_type_id }) => {
					field = {
						...field,
						type: field_type_id
					}
					dispatchUpdate()
				}}
				placement="bottom-start"
			/>
		</div>
		{#if minimal}
			<label class="main column-container">
				<span>Information</span>
				<textarea
					bind:this={info_textarea}
					class="info"
					value={field.options.info || ''}
					on:input={({ target }) => {
						field.options.info = target.value
						dispatchUpdate()
					}}
				/>
			</label>
		{:else}
			<!-- svelte-ignore a11y-label-has-associated-control -->
			<label class="label column-container">
				<span>Label ({field.id})</span>
				<UI.TextInput
					bind:value={field.label}
					placeholder="Heading"
					on:input={({ detail: value }) => {
						if (!key_edited) {
							field.key = validateFieldKey(value)
						}
						dispatchUpdate()
					}}
				/>
			</label>
			<!-- svelte-ignore a11y-label-has-associated-control -->
			<div class="field column-container">
				<label>
					<span>Key</span>
					<UI.TextInput
						placeholder="heading"
						value={field.key}
						on:input={({ detail: value }) => {
							key_edited = true
							field.key = validateFieldKey(value)
							dispatchUpdate()
						}}
					/>
				</label>
			</div>
		{/if}
		{#if top_level && !minimal}
			<div class="toggle">
				{#if getContext('show_static_field')}
					<Toggle
						label="Static"
						toggled={field.is_static}
						on:toggle={({ detail }) => {
							field.is_static = detail
						}}
					/>
				{/if}
			</div>
		{/if}

		<div class="top-right" class:subfield={!top_level}>
			<UI.Dropdown
				icon="carbon:overflow-menu-vertical"
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
										field.options.condition = {
											field: null,
											comparison: '=',
											value: ''
										}
										dispatchUpdate()
									}
								}
						  ]),
					{
						label: 'Sync Field Value', // or 'Mirror Content Value'
						icon: 'fluent-mdl2:dependency-add',
						on_click: () => {
							console.log('sync')
							// add 'source' to field row
							dispatchUpdate()
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
						on_click: () => dispatch('delete', field)
					}
				]}
				placement="bottom-end"
			/>
		</div>
	</div>
	{#if has_subfields}
		<div class="children-container" style:padding-left="{level + 1}rem">
			{#each child_fields.sort((a, b) => a.index - b.index) as subfield, i (subfield.id)}
				<svelte:self
					field={cloneDeep(subfield)}
					top_level={false}
					level={level + 1}
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
					Create Subfield
				</button>
			{/if}
		</div>
	{/if}
	<div class="footer" class:hidden={field.type !== 'select' && !field.options.condition}>
		{#if field.type === 'select'}
			<SelectField {field} {level} on:input={dispatchUpdate} />
		{/if}
		{#if field.options.condition}
			<Condition
				{field}
				field_to_compare={fields.find((f) => f.id === field.options.condition.field)}
				comparable_fields={fields?.filter(
					(f) => ['text', 'number', 'switch', 'url', 'select'].includes(f.type) && f.id !== field.id
				)}
				{collapsed}
				on:input={dispatchUpdate}
			/>
		{/if}
		{#if field.options.sync}
			<SyncField
				{field}
				field_to_compare={fields.find((f) => f.id === field.options.condition.field)}
				comparable_fields={fields?.filter(
					(f) => ['text', 'number', 'switch', 'url', 'select'].includes(f.type) && f.id !== field.id
				)}
				on:input={dispatchUpdate}
			/>
		{/if}
	</div>
</div>

<style lang="postcss">
	.hidden {
		display: none;
	}

	.info {
		border: 1px solid #333333;
		background: transparent;
		color: var(--color-gray-2);
		padding: 0.5rem 0.75rem;
		border-radius: 0.25rem;
		width: 100%;
		font-size: 0.875rem;
	}
	.subfield-button {
		width: 100%;
		border-radius: 0.25rem;
		margin-top: 10px;
		padding: 0.45rem 1rem;
		font-size: var(--font-size-2);
		background-color: #292929;
		color: var(--color-gray-2);
		transition: var(--transition-colors);
		outline: 0;
		display: block;

		&:hover {
			background: #333333;
		}
		/* &:focus {
      background: var(--color-gray-8);
    } */
	}
	.top-container {
		display: grid;
		gap: 1rem;
		position: relative;

		&.top_level {
			background-color: #1a1a1a;
			border-radius: 6px;
			padding: 24px 24px;
		}

		&.collapsed {
			padding: 1rem;

			.top-right {
				top: -1rem;
				right: -1rem;
			}

			.field-container {
				grid-template-columns: 1fr !important;
				gap: 0.75rem;
			}

			.subfield {
				margin-top: 1rem;
				margin-left: auto;
			}
		}
	}

	.top-right {
		position: absolute;
		top: -1rem;
		right: -1.25rem;

		&.subfield {
			top: 50%;
		}
	}

	.children-container {
		display: grid;
		gap: 1rem;
		margin: 1rem 0;
		border-color: var(--color-gray-8);
	}

	.column-container {
		display: flex;
		flex-direction: column;
		flex: 1;

		span {
			font-size: var(--font-size-1);
			padding-bottom: 0.25rem;
			color: #9d9d9d;
		}
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

		label {
			display: flex;
			flex-direction: column;
			flex: 1;

			span {
				font-size: var(--font-size-1);
				padding-bottom: 0.25rem;
				color: #9d9d9d;
			}
		}

		&.minimal {
			grid-template-columns: auto 1fr auto;
		}
	}
	span {
		color: var(--color-gray-3);
	}
</style>
