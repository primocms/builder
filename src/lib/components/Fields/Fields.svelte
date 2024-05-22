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

		const new_content_row = Content_Row({
			field: new_field.id,
			locale: $locale,
			value: getEmptyValue(new_field)
		})
		const updated_content = cloneDeep([...content, new_content_row])
		dispatch_update({
			content: updated_content,
			content_changes: [{ action: 'insert', id: new_content_row.id, data: new_content_row }],
			fields: updated_fields,
			fields_changes: [{ action: 'insert', id: new_field.id, data: new_field }]
		})
	}

	function create_subfield(parent_field) {
		console.log('creating subfield', parent_field)
		// const parent_field = fields.find((f) => f.id === parent_field.parent)
		const number_of_sibling_subfields = fields.filter((f) => f.parent === parent_field.id).length
		const new_field = Field_Row({ parent: parent_field.id, index: number_of_sibling_subfields })
		const updated_fields = cloneDeep([...fields, new_field])

		// create content entries
		const new_entries = []
		const parent_container_entry = content.find((e) => e.field === parent_field.id)
		if (parent_field.type === 'repeater' && parent_container_entry) {
			// add content item for each existing repeater item
			console.log({ content, parent_field, new_field })
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
		console.log({ content, updated_content, new_entries, fields, updated_fields })

		dispatch_update({
			fields: updated_fields,
			fields_changes: [{ action: 'insert', id: new_field.id, data: new_field }],
			content: updated_content,
			content_changes: new_entries.map((entry) => ({ action: 'insert', id: entry.id, data: entry }))
		})
	}

	function delete_field(field) {
		const updated_fields = cloneDeep(
			fields.filter((f) => {
				// root-level & not a match
				if (!f.parent && f.id !== field.id) {
					return true
				}
				// field matches
				if (f.id === field.id) {
					return false
				}
				// is descendent of field
				const ancestors = get_ancestors(f)
				if (ancestors.includes(field.id)) {
					console.log('ancestors includes', field)
					return false
				}
				return true
			})
		)

		const updated_siblings = updated_fields
			.filter((f) => f.parent === field.parent) // select siblings
			.sort((a, b) => a.index - b.index)
			.map((f, i) => ({ ...f, index: i }))

		for (const sibling of updated_siblings) {
			const field = updated_fields.find((f) => f.id === sibling.id)
			field.index = sibling.index
		}

		// filter out unused content
		const deleted_entries = []
		const updated_content = cloneDeep(
			content.filter((entry) => {
				const parent_container = content.find((e) => e.id === entry.parent)
				const field_still_exists = entry.field
					? updated_fields.some((f) => f.id === entry.field) // value entry & container
					: updated_fields.some((f) => f.id === parent_container.field) // repeater entry
				console.log({ entry, field_still_exists, updated_fields })
				// handle value entries & repeater container
				if (!field_still_exists) {
					deleted_entries.push(entry)
				} else return true
			})
		)

		console.log({ updated_content, deleted_entries })

		dispatch_update({
			fields: updated_fields,
			fields_changes: [
				{ action: 'delete', id: field.id },
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
			label: field.label + ' copy',
			index: field.index + 1
		})
		updated_fields.push(new_field)
		updated_field_ids[field.id] = new_field.id

		// updated_fields
		// 	.filter((f) => f.parent === field.parent)
		// 	.sort((a, b) => a.index - b.index)
		// 	.forEach((sibling, i) => {
		// 		console.log('setting', sibling, i)
		// 		sibling.index = i
		// 	})

		// console.log({ updated_fields })

		// for (const sibling of updated_fields.filter(f => f.parent === field.parent)) {
		// 	console.log('setting', sibling)
		// }

		// set updated indeces
		const siblings_and_self = updated_fields
			.filter((f) => f.parent === field.parent)
			.sort((a, b) => a.index - b.index)
			.map((f, i) => ({ ...f, index: i }))
		for (const child of siblings_and_self) {
			const field = updated_fields.find((f) => f.id === child.id)
			console.log('setting', field, field.index, child.index)
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
		console.log({ updated_field_ids, descendent_fields, field, new_field })
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

		console.log({ original_entries, new_entries })
		const updated_content = cloneDeep([...content, ...new_entries])
		console.log({
			updated_field_ids,
			// updated_entry_ids,
			updated_fields,
			fields,
			content,
			updated_content
			// new_content_entries
		})

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
			// content_changes: new_content_entries.map((entry) => ({
			// 	action: 'insert',
			// 	id: entry.id,
			// 	data: entry
			// }))
		})
	}

	function move_field({ field, direction }) {
		// TODO
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
			}))
		})
	}

	function update_field(updated_field) {
		const existing_field = fields.find((f) => f.id === updated_field.id)
		const validated_field = _.cloneDeep(updated_field)
		console.log({ existing_field, validated_field, fields })

		const updated_content = _.cloneDeep(content)
		const relevant_entries = updated_content.filter((e) => e.field === updated_field.id)
		const changed_entries = []

		// type has changed, reset entry values to new type
		if (existing_field.type !== updated_field.type) {
			// TODO: if changing from repeater, remove child entries (dangerous, but could be undone w/ local undo functionality)
			// actually, just let the action do that - it can delete the field, then when updating/creating the content, it can check if the field still exists before proceeding
			for (const entry of relevant_entries) {
				entry.value = getEmptyValue(updated_field)
				changed_entries.push(entry)
			}
		}

		const updated_fields = cloneDeep(
			fields.map((field) => (field.id === updated_field.id ? updated_field : field))
		)

		dispatch_update({
			fields: updated_fields,
			fields_changes: [{ action: 'update', id: updated_field.id, data: updated_field }],
			content: updated_content,
			content_changes: changed_entries.map((entry) => ({
				action: 'update',
				id: entry.id,
				data: entry
			}))
		})
	}

	function validate_changes(existing_changes, new_changes = []) {
		// console.log('validate_changes', { existing_changes, new_changes })
		let validated_changes = _.cloneDeep(existing_changes)

		if (new_changes.length === 0) {
			return validated_changes
		}

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

			// update the existing insertion
			if (action === 'update' && previous_action === 'insert') {
				previous_change_on_same_item.data = { ...previous_data, ...data }
				continue
			}

			// update the existing update
			if (action === 'update' && previous_action === 'update') {
				previous_change_on_same_item.data = { ...previous_data, ...data }
				continue
			}

			// remove previous changes & add the delete
			if (action === 'delete') {
				validated_changes = [
					...validated_changes.filter((c) => c.id !== previous_id),
					{ action, id, data }
				]
			}
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
		console.log({ button_el })
		button_el.onkeydown = (event) => {
			// Check if the Tab key is pressed
			if (event.key === 'Tab') {
				console.log('go there', active_focus)
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
			autofocus={/* autofocus newly created fields */ field.label === ''}
			on:duplicate={({ detail: field }) => duplicate_field(field)}
			on:delete={({ detail: field }) => delete_field(field)}
			on:createsubfield={({ detail: field }) => create_subfield(field)}
			on:move={({ detail }) => move_field(detail)}
			on:input={({ detail: field }) => update_field(field)}
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
