<script>
	import { createEventDispatcher } from 'svelte'
	import _, {
		find,
		cloneDeep,
		chain as _chain,
		set as _set,
		get as _get,
		isRegExp as _isRegExp
	} from 'lodash-es'
	import Card from '../ui/Card.svelte'
	import { userRole, fieldTypes, locale } from '../stores/app'
	import { is_regex, getEmptyValue } from '../utils'
	import { Content_Row } from '../factories'

	export let content
	export let fields
	export let changes
	export let minimal = false

	// TODO: automatically create and delete content rows as 'fields' changes
	// so that SectionEditor and BlockEditor don't have to manage them themselves,
	// should create change records as well for insertion and deletion.
	// Downside is that this component needs to be mounted to create/delete necessary content rows (at least for local stores),
	// so maybe it'll be necessary for Fields.svelte to modify content as well,
	// OR we just handle it in actions.js (but that would only work outside of a modal (i.e. Site & Page Types))
	// OR OR transform_content can just not return content rows for fields that don't exist anymore
	// I'm just worried about getting false positives and would prefer to see an error if there's corrupted data somewhere
	// then again, I could just log the items that aren't being included

	const dispatch = createEventDispatcher()

	function get_ancestors(entry) {
		const parent = content.find((e) => e.id === entry.parent)
		return parent ? [parent.id, ...get_ancestors(parent)] : []
	}

	function get_component(field) {
		const fieldType = find($fieldTypes, ['id', field.type])
		if (fieldType) {
			return fieldType.component
		} else {
			console.warn(`Field type '${field.type}' no longer exists, removing '${field.label}' field`)
			return null
		}
	}

	function check_condition(field) {
		if (!field.options.condition) return true // has no condition

		const { field: field_id, value, comparison } = field.options.condition
		const field_to_compare = fields.find((f) => f.id === field_id)
		if (!field_to_compare) {
			// field has been deleted, reset condition
			field.options.condition = null
			return false
		}

		// TODO: ensure correct field (considering repeaters)
		const { value: comparable_value } = content.find((e) => e.field === field_id)
		if (is_regex(value)) {
			const regex = new RegExp(value.slice(1, -1))
			if (comparison === '=' && regex.test(comparable_value)) {
				return true
			} else if (comparison === '!=' && !regex.test(comparable_value)) {
				return true
			}
		} else if (comparison === '=' && value === comparable_value) {
			return true
		} else if (comparison === '!=' && value !== comparable_value) {
			return true
		}
		return false
	}

	function add_repeater_item({ parent, index, subfields }) {
		const parent_container = content.find((r) => r.id === parent)
		const new_repeater_item = Content_Row({ parent: parent_container.id, index })
		const new_entries = subfields.map((subfield) =>
			Content_Row({
				parent: new_repeater_item.id,
				field: subfield.id,
				value: getEmptyValue(subfield),
				locale: subfield.type === 'repeater' || subfield.type === 'group' ? null : $locale
			})
		)
		const new_rows = [new_repeater_item, ...new_entries]
		const updated_content = cloneDeep([...content, ...new_rows])
		dispatch_update({
			content: updated_content,
			changes: new_rows.map((row) => ({ action: 'insert', id: row.id, data: row }))
		})
	}

	function remove_repeater_item(item) {
		let updated_content = cloneDeep(content.filter((c) => c.id !== item.id)) // remove repeater item entry

		// get siblings, update indeces
		const siblings = updated_content
			.filter((c) => c.parent === item.parent)
			.sort((a, b) => a.index - b.index)
			.map((c, i) => ({ ...c, index: i }))
		for (const sibling of siblings) {
			const entry = updated_content.find((c) => c.id === sibling.id)
			entry.index = sibling.index
		}

		// remove descendents
		updated_content = updated_content.filter((entry) => {
			const is_descendent = get_ancestors(entry).includes(item.id)
			if (is_descendent) {
				return false
			} else return true
		})

		dispatch_update({
			content: updated_content,
			changes: [{ action: 'delete', id: item.id }]
		})
	}

	function move_repeater_item({ item, direction }) {
		const updated_content = cloneDeep(content)

		// select siblings (could be root level)
		const siblings = updated_content
			.filter((c) => c.parent === item.parent && c.id !== item.id)
			.sort((a, b) => a.index - b.index)

		// update siblings & self w/ new indeces
		const updated_children = {
			up: [...siblings.slice(0, item.index - 1), item, ...siblings.slice(item.index - 1)],
			down: [...siblings.slice(0, item.index + 1), item, ...siblings.slice(item.index + 1)]
		}[direction].map((f, i) => ({ ...f, index: i }))

		// set updated_content w/ updated indeces
		for (const child of updated_children) {
			const row = updated_content.find((c) => c.id === child.id)
			row.index = child.index
		}
		dispatch_update({
			content: updated_content,
			changes: updated_children.map((child) => ({
				action: 'update',
				id: child.id,
				data: { index: child.index }
			}))
		})
	}

	function validate_changes(new_changes = []) {
		let validated_changes = _.cloneDeep(changes)

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

			const { action: previous_action, data: previous_data } = previous_change_on_same_item

			if (action === 'update' && previous_action === 'insert') {
				previous_change_on_same_item.data = { ...previous_data, ...data }
				continue
			}

			if (action === 'update') {
				previous_change_on_same_item.data = { ...previous_data, ...data }
				continue
			}

			if (action === 'delete') {
				validated_changes = validated_changes.filter((c) => {
					// remove insert/updates on entry
					if (c.id === change.id) return false

					// remove insert/updates on entry descendents
					const entry = content.find((e) => e.id === c.id)
					if (get_ancestors(entry).includes(change.id)) {
						return false
					}

					return true
				})
			}
		}
		return validated_changes
	}

	function dispatch_update(updated) {
		dispatch('input', {
			content: _.cloneDeep(updated.content),
			changes: validate_changes(updated.changes)
		})
	}
</script>

<div class="Content">
	{#each fields.filter((f) => !f.parent).sort((a, b) => a.index - b.index) as field}
		{@const matching_content_row = content.find((r) => r.field === field.id)}
		{@const Field_Component = get_component(field)}
		{@const is_visible = check_condition(field)}
		{@const is_valid = (field.key || field.type === 'info') && Field_Component}
		{@const has_child_fields = field.type === 'repeater' || field.type === 'group'}
		{#if is_valid && is_visible}
			<Card
				title={has_child_fields ? field.label : null}
				icon={$fieldTypes.find((ft) => ft.id === field.type)?.icon}
				pill={field.is_static ? 'Static' : null}
				{minimal}
			>
				<div class="field-item" id="field-{field.key}" class:repeater={field.key === 'repeater'}>
					<svelte:component
						this={Field_Component}
						id={matching_content_row.id}
						value={matching_content_row.value}
						{content}
						{field}
						{fields}
						autocomplete={matching_content_row.value === ''}
						on:keydown
						on:add={({ detail }) => add_repeater_item(detail)}
						on:remove={({ detail }) => remove_repeater_item(detail)}
						on:move={({ detail }) => move_repeater_item(detail)}
						on:input={({ detail }) => {
							const row_id = detail.id || matching_content_row.id
							const data = detail.data || detail

							const updated_content = content.map((row) =>
								row.id === row_id ? { ...row, ...data } : row
							)

							dispatch_update({
								content: updated_content,
								changes: [{ action: 'update', id: row_id, data }]
							})
						}}
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
</div>

<style lang="postcss">
	.Content {
		width: 100%;
		display: grid;
		gap: 1rem;
		padding-bottom: 0.5rem;
		/* padding-block: 0.5rem; */
		color: var(--color-gray-2);
		/* background: var(--primo-color-black); */
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
			justify-content: center;
			margin-top: 12px;
		}
	}
</style>
