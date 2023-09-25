<script>
	import _, { cloneDeep, chain as _chain, isEqual } from 'lodash-es'
	import { getContext } from 'svelte'
	import autosize from 'autosize'
	import Toggle from 'svelte-toggle'
	import { createEventDispatcher } from 'svelte'
	const dispatch = createEventDispatcher()

	import EditField from './inputs/EditField.svelte'
	import fieldTypes from '../stores/app/fieldTypes'
	import SelectField from '../field-types/SelectField.svelte'
	import { getEmptyValue } from '../utils'

	export let level = 0
	export let field
	export let isFirst
	export let isLast
	export let options = []
	export let top_level = true

	function validateFieldKey(key) {
		// replace dash and space with underscore
		return key.replace(/-/g, '_').replace(/ /g, '_').toLowerCase()
	}

	function dispatchUpdate() {
		// prevent fields from being saved with invalid values
		const updated_field = cloneDeep(field)
		updated_field.value = fix_field_values(updated_field)
		dispatch('input', updated_field)
	}

	function fix_group_value(field) {
		const valid_value = valid_field_value(field.type, field.value)
		if (!valid_value) return getEmptyValue(field)

		const updated_field_value = _.cloneDeep(field.value)
		for (let subfield of field.fields) {
			if (subfield.type === 'repeater') {
				updated_field_value[subfield.key] = fix_repeater_value(subfield)
			} else if (subfield.type === 'group') {
				updated_field_value[subfield.key] = fix_group_value(subfield)
			} else {
				const subfield_value = updated_field_value[subfield.key]
				const valid_value = valid_field_value(subfield.type, subfield_value)
				if (!valid_value) {
					updated_field_value[subfield.key] = getEmptyValue(subfield)
				}
			}
		}
		return updated_field_value
	}

	function fix_repeater_value(field) {
		if (!valid_field_value(field.type, field.value)) return getEmptyValue(field)

		const updated_field_value = _.cloneDeep(field.value).map((item) => {
			for (let subfield of field.fields) {
				if (subfield.type === 'repeater') {
					item[subfield.key] = fix_repeater_value(subfield)
				} else if (subfield.type === 'group') {
					item[subfield.key] = fix_group_value(subfield)
				} else {
					const subfield_value = item[subfield.key]
					const valid_value = valid_field_value(subfield.type, subfield_value)
					if (!valid_value) {
						item[subfield.key] = getEmptyValue(subfield)
					}
				}
			}
			return item
		})

		return updated_field_value
	}

	function fix_field_values(field) {
		if (field.type === 'repeater') {
			return fix_repeater_value(field)
		} else if (field.type === 'group') {
			return fix_group_value(field)
		} else {
			const valid_value = valid_field_value(field.type, field.value)
			if (!valid_value) {
				return getEmptyValue(field)
			} else return field.value
		}
	}

	function valid_field_value(type, field_value) {
		if (field_value === undefined) return false
		if (type === 'repeater') {
			return Array.isArray(field_value)
		} else if (type === 'group') {
			return typeof field_value === 'object' && !Array.isArray(field_value)
		} else if (type === 'image') {
			return typeof field_value === 'object' && 'url' in field_value && 'alt' in field_value
		} else if (type === 'link') {
			return typeof field_value === 'object' && 'url' in field_value && 'label' in field_value
		} else if (type === 'markdown') {
			return typeof field_value === 'object' && 'markdown' in field_value && 'html' in field_value
		} else if (type === 'text') {
			return typeof field_value === 'string'
		} else if (type === 'url') {
			return typeof field_value === 'string'
		} else if (type === 'number') {
			return typeof field_value === 'number'
		} else if (type === 'switch') {
			return typeof field_value === 'boolean'
		} else {
			console.warn('Unhandled field type', type, field_value)
			return true
		}
	}

	$: visibilityOptions = field.fields
		.filter((f) => f.type === 'select')
		.map((f) => ({
			label: f.label,
			key: f.key,
			options: f.options.options || []
		}))

	// Auto-fill key when setting label
	let key_edited = false

	// autosize info textarea
	let info_textarea
	$: if (info_textarea) {
		autosize(info_textarea)
	}
</script>

<EditField
	{level}
	{isFirst}
	{isLast}
	{top_level}
	has_subfields={field.type === 'group' || field.type === 'repeater'}
	minimal={field.type === 'info'}
	showDefaultValue={['content', 'number', 'url', 'select', 'text'].includes(field.type)}
	showVisibilityOptions={field.type !== 'select' && options.length > 0 ? options : false}
	on:duplicate={() => dispatch('duplicate', field)}
	on:delete={() => dispatch('delete', field)}
	on:move={({ detail: direction }) => dispatch('move', { field, direction })}
>
	<select
		on:change={({ target }) => {
			field = {
				...field,
				type: target.value
			}
			dispatchUpdate()
		}}
		value={field.type}
		slot="type"
	>
		{#each $fieldTypes as field}
			<option value={field.id}>{field.label}</option>
		{/each}
	</select>
	<textarea
		bind:this={info_textarea}
		slot="main"
		class="info"
		value={field.options.info || ''}
		on:input={({ target }) => {
			field.options.info = target.value
			dispatchUpdate()
		}}
	/>
	<input
		class="input label-input"
		type="text"
		placeholder="Heading"
		bind:value={field.label}
		on:input={({ target }) => {
			if (!key_edited) {
				field.key = validateFieldKey(target.value)
			}
			dispatchUpdate()
		}}
		slot="label"
	/>
	<input
		class="input key-input"
		type="text"
		placeholder="heading"
		value={field.key}
		on:input={({ target }) => {
			key_edited = true
			field.key = validateFieldKey(target.value)
			dispatchUpdate()
		}}
		slot="key"
	/>
	<input
		class="input key-input"
		type="text"
		placeholder="Lorem ipsum"
		value={field.default}
		on:input={({ target }) => {
			field.default = target.value
			dispatchUpdate()
		}}
		slot="default-value"
	/>
	<select
		on:change={({ target }) => {
			field = {
				...field,
				options: {
					...field.options,
					hidden: target.value
				}
			}
			dispatchUpdate()
		}}
		value={field.options.hidden || '__show'}
		slot="hide"
	>
		<option value="__show">Always</option>
		{#each options as item}
			<optgroup label={item.label}>
				{#each item.options as option}
					<option value={option.value}>{option.label}</option>
				{/each}
			</optgroup>
		{/each}
	</select>
	<div slot="toggle">
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

	<!-- <input type="checkbox" bind:checked={field.is_static} slot="static" /> -->

	{#each field.fields as subfield, i (subfield.id)}
		<svelte:self
			field={cloneDeep(subfield)}
			isFirst={i === 0}
			isLast={i === field.fields.length - 1}
			options={visibilityOptions}
			top_level={false}
			level={level + 1}
			on:delete
			on:move
			on:createsubfield
			on:input={({ detail: updatedSubfield }) => {
				field.fields = field.fields.map((subfield) =>
					subfield.id === updatedSubfield.id ? updatedSubfield : subfield
				)
				dispatchUpdate()
			}}
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
</EditField>
{#if field.type === 'select'}
	<SelectField {field} {level} on:input={dispatchUpdate} />
{/if}

<style>
	select[slot='hide'] {
		background: transprarent;
		border: 1px solid #333333;
		padding: 0.25rem;
	}
	select[slot='type'] {
		height: 100%;
		width: 100%;
		border: 1px solid #333333;
		border-radius: 0.25rem;
		background: #1f1f1f;
		color: #b6b6b6;
		font-size: var(--font-size-2);
		font-weight: 400;
		padding: 0.5rem;
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
		/* &:focus {
      background: var(--color-gray-8);
    } */
	}
	.subfield-button:hover {
			background: #333333;
		}

	.input {
		border: 1px solid #333333;
		background: #1f1f1f;
		padding: 0.5rem 0.75rem;
		border-radius: 0.25rem;
		height: 100%;
		font-size: var(--font-size-2);
		color: #858585;
	}

	.input::-moz-placeholder {
			color: var(--color-gray-7);
		}

	.input::placeholder {
			color: var(--color-gray-7);
		}

	.input:focus {
			outline: 0;
			border: 1px solid #b5b5b5;
			transition: 0.3s;
			color: #b6b6b6;
		}</style>
