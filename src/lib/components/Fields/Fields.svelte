<script>
	import { createEventDispatcher } from 'svelte'
	import Icon from '@iconify/svelte'
	import _, {
		cloneDeep,
		chain as _chain,
		set as _set,
		get as _get,
		isRegExp as _isRegExp
	} from 'lodash-es'
	import { Field_Row, Content_Row } from '../../factories'
	import FieldItem from './FieldItem.svelte'
	import { locale } from '../../stores/app'
	import { getEmptyValue } from '../../utils.js'

	export let fields
	export let fields_changes

	export let content
	export let content_changes

	$: parent_fields = fields.filter((f) => !f.parent)

	const dispatch = createEventDispatcher()

	function get_ancestors(field) {
		const parent = fields.find((f) => f.id === field.parent)
		return parent ? [parent.id, ...get_ancestors(parent)] : []
	}

	function create_field() {
		const new_field = Field_Row({ index: parent_fields.length })
		const updated_fields = cloneDeep([...fields, new_field])

		const new_content_entry = Content_Row({
			field: new_field.id,
			locale: $locale,
			value: getEmptyValue(new_field)
		})
		const updated_content = cloneDeep([...content, new_content_entry])
		dispatch_update({
			content: updated_content,
			content_changes: [{ action: 'insert', id: new_content_entry.id, data: new_content_entry }],
			fields: updated_fields,
			fields_changes: [{ action: 'insert', id: new_field.id, data: new_field }]
		})
	}

	function create_subfield(parent_field) {
		const number_of_sibling_subfields = fields.filter((f) => f.parent === parent_field.id).length
		const new_field = Field_Row({ parent: parent_field.id, index: number_of_sibling_subfields })
		const updated_fields = cloneDeep([...fields, new_field])

		// create content entries
		const new_entries = []
		const parent_container_entry = content.find((e) => e.field === parent_field.id)
		if (parent_field.type === 'repeater' && parent_container_entry) {
			// add content item for each existing repeater item
			const repeater_item_entries = content.filter((e) => e.parent === parent_container_entry.id)
			for (const repeater_item_entry of repeater_item_entries) {
				const new_entry = Content_Row({
					parent: repeater_item_entry.id,
					field: new_field.id,
					value: getEmptyValue(new_field),
					locale: ['repeater', 'group'].includes(new_field.type) ? null : $locale
				})
				new_entries.push(new_entry)
			}
		} else if (parent_field.type === 'group' && parent_container_entry) {
			const new_entry = Content_Row({
				parent: parent_container_entry.id,
				field: new_field.id,
				value: getEmptyValue(new_field),
				locale: ['repeater', 'group'].includes(new_field.type) ? null : $locale
			})
			new_entries.push(new_entry)
		}
		const updated_content = cloneDeep([...content, ...new_entries])

		dispatch_update({
			fields: updated_fields,
			fields_changes: [{ action: 'insert', id: new_field.id, data: new_field }],
			content: updated_content,
			content_changes: new_entries.map((entry) => ({ action: 'insert', id: entry.id, data: entry }))
		})
	}

	function delete_field(field) {
		const deleted_fields = []
		const updated_fields = cloneDeep(
			fields.filter((f) => {
				// root-level & not a match
				if (!f.parent && f.id !== field.id) {
					return true
				}
				// field matches
				if (f.id === field.id) {
					deleted_fields.push(field)
					return false
				}
				// is descendent of field
				if (get_ancestors(f).includes(field.id)) {
					deleted_fields.push(field)
					return false
				}
				return true
			})
		)

		// update sibling indeces
		const updated_siblings = updated_fields
			.filter((f) => f.parent === field.parent)
			.sort((a, b) => a.index - b.index)
			.map((f, i) => ({ ...f, index: i }))
		for (const sibling of updated_siblings) {
			const field = updated_fields.find((f) => f.id === sibling.id)
			field.index = sibling.index
		}

		// delete unused content
		const deleted_entries = []
		const updated_content = cloneDeep(
			content.filter((entry) => {
				const parent_container = content.find((e) => e.id === entry.parent)
				const field_still_exists = entry.field
					? updated_fields.some((f) => f.id === entry.field) // value entry & container
					: updated_fields.some((f) => f.id === parent_container.field) // repeater entry
				if (!field_still_exists) {
					deleted_entries.push(entry)
				} else return true
			})
		)

		dispatch_update({
			fields: updated_fields,
			fields_changes: [
				...deleted_fields.map((field) => ({ action: 'delete', id: field.id })),
				...updated_siblings.map((sibling) => ({
					action: 'update',
					id: sibling.id,
					data: { index: sibling.index }
				}))
			],
			content: updated_content,
			content_changes: deleted_entries.map((e) => ({ action: 'delete', id: e.id }))
		})
	}

	function duplicate_field(field) {
		const updated_fields = cloneDeep(fields)
		const updated_field_ids = {}

		// add duplicate field
		const new_field = Field_Row({
			...field,
			key: field.key + '_copy',
			label: field.label + ' copy'
		})
		updated_fields.push(new_field)
		updated_field_ids[field.id] = new_field.id

		// set updated indeces
		const siblings_and_self = updated_fields
			.filter((f) => f.parent === field.parent)
			.sort((a, b) => a.index - b.index)
			.map((f, i) => ({ ...f, index: i }))
		for (const child of siblings_and_self) {
			const field = updated_fields.find((f) => f.id === child.id)
			field.index = child.index
		}

		// clone descendent fields & update IDs
		const descendent_fields = fields
			.filter((f) => get_ancestors(f).includes(field.id))
			.map((f) => {
				const new_field = Field_Row(f)
				updated_field_ids[f.id] = new_field.id
				return new_field
			}) // get new IDs

		for (const descendent of descendent_fields) {
			descendent.parent = updated_field_ids[descendent.parent]
		}
		updated_fields.push(...descendent_fields)

		const original_entries = content.filter((e) => e.field === field.id)
		const new_entries = original_entries.map((entry) =>
			Content_Row({
				...entry,
				field: updated_field_ids[entry.field]
			})
		)
		const updated_content = cloneDeep([...content, ...new_entries])

		dispatch_update({
			fields: updated_fields,
			fields_changes: [
				{ action: 'insert', id: new_field.id, data: new_field },
				...siblings_and_self.map((field) => ({
					action: 'update',
					id: field.id,
					data: { index: field.index }
				})),
				...descendent_fields.map((field) => ({
					action: 'insert',
					id: field.id,
					data: field
				}))
			],
			content: updated_content,
			content_changes: new_entries.map((entry) => ({
				action: 'insert',
				id: entry.id,
				data: entry
			}))
		})
	}

	function move_field({ field, direction }) {
		const updated_fields = cloneDeep(fields)

		// select siblings (could be root level)
		const siblings = updated_fields
			.filter((f) => f.parent === field.parent && f.id !== field.id)
			.sort((a, b) => a.index - b.index)

		// update siblings & self w/ new indeces
		const updated_children = {
			up: [...siblings.slice(0, field.index - 1), field, ...siblings.slice(field.index - 1)],
			down: [...siblings.slice(0, field.index + 1), field, ...siblings.slice(field.index + 1)]
		}[direction].map((f, i) => ({ ...f, index: i }))

		// set updated_fields w/ updated indeces
		for (const child of updated_children) {
			const field = updated_fields.find((f) => f.id === child.id)
			field.index = child.index
		}
		dispatch_update({
			fields: updated_fields,
			fields_changes: updated_children.map((child) => ({
				action: 'update',
				id: child.id,
				data: { index: child.index }
			})),
			content,
			content_changes
		})
	}

	function update_field({ id, data }) {
		// TODO: ensure only passing updated properties
		const updated_field = cloneDeep({ ...fields.find((f) => f.id === id), ...data })
		let updated_fields = cloneDeep(
			fields.map((f) => (f.id === updated_field.id ? updated_field : f))
		)
		const existing_field = fields.find((f) => f.id === updated_field.id)
		const deleted_fields = []

		let updated_content = _.cloneDeep(content)
		const field_content_entries = updated_content.filter((e) => e.field === updated_field.id)
		const updated_entries = []
		const deleted_entries = []

		// type has changed, reset entry values to new type & remove children
		if (existing_field.type !== updated_field.type) {
			// reset field entry value
			for (const entry of field_content_entries) {
				entry.value = getEmptyValue(updated_field)
				updated_entries.push(entry)
			}

			// delete any child fields
			if (existing_field.type === 'group' || existing_field.type === 'repeater') {
				updated_fields = updated_fields.filter((field) => {
					if (get_ancestors(field).includes(updated_field.id)) {
						deleted_fields.push(field)
						return false
					} else return true
				})

				// delete any child content entries

				updated_content = updated_content.filter((entry) => {
					const parent_container = content.find((e) => e.id === entry.parent)
					const entry_field_deleted = entry.field
						? deleted_fields.some((f) => f.id === entry.field) // value entry & container
						: deleted_fields.some((f) => f.id === parent_container.field) // repeater entry
					const is_child_repeater_entry = parent_container?.field === updated_field.id
					if (entry_field_deleted || is_child_repeater_entry) {
						deleted_entries.push(entry)
						return false
					}
					return true
				})
			}
		}

		dispatch_update({
			fields: updated_fields,
			fields_changes: [
				{ action: 'update', id: updated_field.id, data },
				...deleted_fields.map((field) => ({ action: 'delete', id: field.id, data: field }))
			],
			content: updated_content,
			content_changes: [
				...updated_entries.map((entry) => ({ action: 'update', id: entry.id, data: entry })),
				...deleted_entries.map((entry) => ({ action: 'delete', id: entry.id, data: entry }))
			]
		})
	}

	function validate_changes(existing_changes, new_changes = []) {
		// console.log('validate_changes', { existing_changes, new_changes })
		let validated_changes = _.cloneDeep(existing_changes)

		for (const change of new_changes) {
			const { action, id, data } = change
			const previous_change_on_same_item = validated_changes.find((c) => c.id === change.id)
			if (!previous_change_on_same_item) {
				validated_changes = [...validated_changes, { action, id, data }]
				continue
			}

			const {
				id: previous_id,
				action: previous_action,
				data: previous_data
			} = previous_change_on_same_item

			// update the existing insertion/update
			if (action === 'update') {
				previous_change_on_same_item.data = { ...previous_data, ...data }
				continue
			}

			// remove previous change and descendents
			if (action === 'delete') {
				validated_changes = validated_changes.filter((c) => c.id !== previous_id)

				// add delete change for db-existing field
				if (previous_action === 'update') {
					validated_changes.push({ action, id, data })
				}

				continue
			}

			console.log('HANDLE THIS', change)
		}
		// console.log('validate_changes', { validated_changes })
		return validated_changes
	}

	function dispatch_update(update) {
		dispatch('input', {
			fields: update.fields,
			fields_changes: validate_changes(fields_changes, update.fields_changes),
			content: update.content || content,
			content_changes: validate_changes(content_changes, update.content_changes)
		})
	}

	// Auto-focus 'Create Field' button when component mounts
	let button_el
	$: if (button_el) {
		const active_focus = document.activeElement
		button_el.focus()
		button_el.onkeydown = (event) => {
			// Check if the Tab key is pressed
			if (event.key === 'Tab') {
				event.preventDefault()
				active_focus.focus()
			}
		}
	}
</script>

<div class="Fields">
	{#each parent_fields.sort((a, b) => a.index - b.index) as field (field.id)}
		<FieldItem
			{field}
			{fields}
			on:duplicate={({ detail: field }) => duplicate_field(field)}
			on:delete={({ detail: field }) => delete_field(field)}
			on:createsubfield={({ detail: field }) => create_subfield(field)}
			on:move={({ detail }) => move_field(detail)}
			on:input={({ detail }) => update_field(detail)}
			on:keydown
		/>
	{/each}
	<button class="field-button" on:click={create_field} bind:this={button_el}>
		<div class="icon">
			<Icon icon="fa-solid:plus" />
		</div>
		<span>Create Field</span>
	</button>
</div>

<style lang="postcss">
	.Fields {
		width: 100%;
		display: grid;
		gap: 1rem;
		padding-top: 0.5rem;
		padding-bottom: 1rem;
		color: var(--color-gray-2);
		height: 100%;
		overflow-y: auto;
		place-content: flex-start;
		justify-content: stretch;
	}
	.field-button {
		width: 100%;
		/* background: #292929; */
		background: #1f1f1f;
		color: var(--button-color);
		border-radius: 1px;
		transition: background 0.1s, color 0.1s;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		/* font-size: 0.875rem; */
		font-size: var(--font-size-2);
		padding: 0.5rem;
		border-radius: 4px;
		font-weight: 400;
		border: 1px solid transparent;
		transition: 0.1s;

		&:hover {
			/* background: #333333; */
			background: #292929;
		}

		&:focus {
			border-color: var(--primo-color-brand);
		}
		&:focus-visible {
			outline: 0;
		}
	}
</style>
