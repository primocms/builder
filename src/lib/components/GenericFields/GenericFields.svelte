<script>
	import { createEventDispatcher } from 'svelte'
	import Icon from '@iconify/svelte'
	import _, {
		find,
		cloneDeep,
		chain as _chain,
		set as _set,
		get as _get,
		isRegExp as _isRegExp
	} from 'lodash-es'
	import Card from '../../ui/Card.svelte'
	import { createUniqueID } from '../../utilities'

	import { userRole, fieldTypes } from '../../stores/app'
	import { Field } from '../../factories'
	import FieldItem from './FieldItem.svelte'
	import { is_regex } from '../../utils'

	export let fields
	export let showCode = true

	const dispatch = createEventDispatcher()

	function addField() {
		fields = [...fields, Field()]
		dispatch('input')
	}

	function createSubfield(field) {
		const idPath = getFieldPath(fields, field.id)
		let updatedFields = cloneDeep(fields)
		handleSubfieldCreation(fields)

		function handleSubfieldCreation(fieldsToModify) {
			if (find(fieldsToModify, ['id', field.id])) {
				// field is at this level
				const newField = cloneDeep(field)
				newField.fields = [...newField.fields, Field()]
				_set(updatedFields, idPath, newField)
			} else {
				// field is lower
				fieldsToModify.forEach((field) => handleSubfieldCreation(field.fields))
			}
		}
		fields = updatedFields
		dispatch('input')
	}

	function delete_field(field) {
		const idPath = getFieldPath(fields, field.id)
		let updatedFields = cloneDeep(fields)

		let parentField = _get(updatedFields, idPath.slice(0, -2))
		if (parentField) {
			handleDeleteSubfield(fields)
		} else {
			fields = fields.filter((f) => f.id !== field.id)
		}
		dispatch('delete')

		function handleDeleteSubfield(fieldsToModify) {
			if (find(fieldsToModify, ['id', parentField.id])) {
				const newField = cloneDeep(parentField)
				newField.fields = newField.fields.filter((f) => f.id != field.id)
				_set(updatedFields, idPath.slice(0, -2), newField)
			} else {
				fieldsToModify.forEach((field) => handleDeleteSubfield(field.fields))
			}
			fields = updatedFields
		}
	}

	let disabled = false

	function getComponent(field) {
		const fieldType = find($fieldTypes, ['id', field.type])
		if (fieldType) {
			return fieldType.component
		} else {
			console.warn(`Field type '${field.type}' no longer exists, removing '${field.label}' field`)
			return null
		}
	}

	function duplicate_field(field) {
		const idPath = getFieldPath(fields, field.id)

		let updatedFields = cloneDeep(fields)

		handle_field_duplicate(fields)

		function handle_field_duplicate(fieldsToModify) {
			const indexToMove = fieldsToModify.findIndex((f) => f.id === field.id)
			if (indexToMove > -1) {
				// field is at this level
				const newFields = [
					...fieldsToModify.slice(0, indexToMove + 1),
					cloneDeep({
						...field,
						id: createUniqueID(),
						key: field.key + '_copy',
						label: field.label + ' copy'
					}),
					...fieldsToModify.slice(indexToMove + 1)
				]
				if (idPath.length === 1) {
					// field is at root level
					updatedFields = newFields
				} else {
					const path = idPath.slice(0, -1) // modify 'fields' containing field being moved
					_set(updatedFields, path, newFields)
				}
			} else {
				// field is lower
				fieldsToModify.forEach((field) => handle_field_duplicate(field.fields))
			}
		}
		fields = updatedFields
	}

	function move_field({ field, direction }) {
		const idPath = getFieldPath(fields, field.id)

		let updatedFields = cloneDeep(fields)

		handleFieldMove(fields)

		function handleFieldMove(fieldsToModify) {
			const indexToMove = fieldsToModify.findIndex((f) => f.id === field.id)
			if (indexToMove > -1) {
				// field is at this level
				const withoutItem = fieldsToModify.filter((_, i) => i !== indexToMove)
				const newFields = {
					up: [
						...withoutItem.slice(0, indexToMove - 1),
						field,
						...withoutItem.slice(indexToMove - 1)
					],
					down: [
						...withoutItem.slice(0, indexToMove + 1),
						field,
						...withoutItem.slice(indexToMove + 1)
					]
				}[direction]
				if (idPath.length === 1) {
					// field is at root level
					updatedFields = newFields
				} else {
					const path = idPath.slice(0, -1) // modify 'fields' containing field being moved
					_set(updatedFields, path, newFields)
				}
			} else {
				// field is lower
				fieldsToModify.forEach((field) => handleFieldMove(field.fields))
			}
		}
		fields = updatedFields
	}

	function getFieldPath(fields, id) {
		for (const [i, field] of fields.entries()) {
			const result = getFieldPath(field.fields, id)
			if (result) {
				result.unshift(i, 'fields')
				return result
			} else if (field.id === id) {
				return [i]
			}
		}
	}

	function check_condition(field) {
		if (!field.options.condition) return true // has no condition
		const field_to_compare = fields.find((f) => f.id === field.options.condition?.field)
		if (!field_to_compare) {
			// field has been deleted, reset condition
			field.options.condition = null
			return false
		}
		const { value, comparison } = field.options.condition
		if (is_regex(value)) {
			const regex = new RegExp(value.slice(1, -1))
			if (comparison === '=' && regex.test(field_to_compare.value)) {
				return true
			} else if (comparison === '!=' && !regex.test(field_to_compare.value)) {
				return true
			}
		} else if (comparison === '=' && value === field_to_compare.value) {
			return true
		} else if (comparison === '!=' && value !== field_to_compare.value) {
			return true
		}
		return false
	}
</script>

<div class="GenericFields">
	{#if showCode}
		{#each fields as field (field.id)}
			<FieldItem
				{fields}
				{field}
				on:duplicate={({ detail: field }) => duplicate_field(field)}
				on:delete={({ detail: field }) => delete_field(field)}
				on:move={({ detail }) => move_field(detail)}
				on:createsubfield={({ detail: field }) => createSubfield(field)}
				on:addcondition={({ detail: field }) => {
					field = {
						...field,
						options: {
							...field.options,
							condition: {
								field: null,
								comparison: '=',
								value: ''
							}
						}
					}
					dispatch('input')
				}}
				on:input={({ detail }) => {
					field = detail
					dispatch('input')
				}}
			/>
		{/each}
		<button class="field-button" on:click={addField} {disabled}>
			<div class="icon">
				<Icon icon="fa-solid:plus" />
			</div>
			<span>Add a Field</span>
		</button>
	{:else}
		{#each fields as field}
			{@const is_visible = check_condition(field)}
			{@const is_valid = (field.key || field.type === 'info') && getComponent(field)}
			{@const has_child_fields = field.fields.length > 0}
			{#if is_valid && is_visible}
				<Card
					title={has_child_fields ? field.label : null}
					icon={$fieldTypes.find((ft) => ft.id === field.type)?.icon}
					pill={field.is_static ? 'Static' : null}
				>
					<div class="field-item" id="field-{field.key}" class:repeater={field.key === 'repeater'}>
						<svelte:component
							this={getComponent(field)}
							{field}
							fields={fields.filter((f) => f.id !== field.id)}
							on:save
							on:input
						/>
					</div>
				</Card>
			{:else if is_visible}
				<p class="empty-description">Field requires a key</p>
			{/if}
		{:else}
			<p class="empty-description">
				{#if $userRole === 'DEV'}
					When you create fields, they'll be editable from here
				{:else}
					When the site developer creates fields, they'll be editable from here
				{/if}
			</p>
		{/each}
	{/if}
</div>

<style lang="postcss">
	.GenericFields {
		width: 100%;
		display: grid;
		gap: 1rem;
		padding-bottom: 1rem;
		color: var(--color-gray-2);
		background: var(--primo-color-black);
		min-width: 23rem;
		height: 100%;
		overflow-y: auto;
		place-content: flex-start;
		justify-content: stretch;

		.empty-description {
			color: var(--color-gray-4);
			font-size: var(--font-size-2);
			text-align: center;
			height: 100%;
			display: flex;
			align-items: flex-start;
			padding: 6rem;
			justify-content: center;
			margin-top: 12px;
		}
	}
	.field-button {
		width: 100%;
		background: #292929;
		color: var(--button-color);
		padding: 0.5rem 0;
		border-radius: 1px;
		transition: background 0.1s, color 0.1s;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		font-size: 0.875rem;
		padding: 0.75rem;
		border-radius: 4px;
		font-weight: 400;

		&:hover {
			background: #333333;
		}
	}
</style>
