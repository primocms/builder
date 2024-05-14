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
	import { userRole, fieldTypes } from '../stores/app'
	import { is_regex, getEmptyValue } from '../utils'
	import { Content_Row } from '../factories'

	export let content
	export let fields
	export let minimal = false

	const dispatch = createEventDispatcher()

	function getComponent(field) {
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

	function add_repeater_item({ parent, index, subfields }) {
		const new_repeater_item = Content_Row({ parent, index })
		const new_subcontent = subfields.map(
			(s) => Content_Row({ parent: new_repeater_item.id, field: s.id, value: getEmptyValue(s) }) // TODO: set default value
		)
		const new_rows = [new_repeater_item, ...new_subcontent]
		const updated_content = cloneDeep([...content, ...new_rows])
		dispatch_update({
			content: updated_content,
			changes: new_rows.map((row) => ({ action: 'insert', id: row.id, data: row }))
		})
		// dispatch('input', updated_content)
		// new_rows.forEach((row) => store_change({ action: 'insert', id: row.id, data: row }))
	}

	function remove_repeater_item(item) {
		const updated_content = cloneDeep(content.filter((c) => c.id !== item.id))
		// get siblings, update indeces
		const updated_siblings = updated_content
			.filter((c) => c.parent === item.parent) // remove self, select siblings
			.sort((a, b) => a.index - b.index)
			.map((c, i) => ({ ...c, index: i }))
		for (const sibling of updated_siblings) {
			const row = updated_content.find((c) => c.id === sibling.id)
			row.index = sibling.index
		}
		// dispatch('input', updated_content)
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
		// dispatch('input', updated_content)
		// updated_children.forEach((child) =>
		// 	store_change({ action: 'update', id: child.id, data: { index: child.index } })
		// )
	}

	// function dispatch_update({ id, data }) {
	// 	const updated_content = cloneDeep(
	// 		content.map((row) => (row.id === id ? { ...row, ...data } : row))
	// 	)
	// 	dispatch('input', updated_content)
	// 	store_change({ action: 'update', id, data })
	// }

	let all_changes = []
	function store_change({ action, id, data }) {
		const existing_change = all_changes.find((change) => change.id === id)
		if (action === 'update' && existing_change) {
			existing_change.data = { ...existing_change.data, ...data }
		} else if (action === 'delete' && existing_change) {
			all_changes = all_changes.filter((t) => t.id !== existing_change.id)
		} else {
			all_changes = [...all_changes, { action, id, data }]
		}
		// dispatch('change', { all: _.cloneDeep(all_changes), action, id, data })
	}

	function dispatch_update({ content, changes }) {
		changes.forEach((change) => {
			store_change(change)
		})
		dispatch('input', {
			content,
			changes,
			all_changes: _.cloneDeep(all_changes)
		})
	}
</script>

<div class="Content">
	{#each fields.filter((f) => !f.parent).sort((a, b) => a.index - b.index) as field}
		{@const matching_content_row = content.find((r) => r.field === field.id)}
		{@const is_visible = check_condition(field)}
		{@const is_valid = (field.key || field.type === 'info') && getComponent(field)}
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
						this={getComponent(field)}
						{field}
						id={matching_content_row?.id}
						value={matching_content_row?.value}
						subfields={fields.filter((f) => f.parent === field.id)}
						{fields}
						{content}
						on:save
						on:add={({ detail }) => add_repeater_item(detail)}
						on:remove={({ detail }) => remove_repeater_item(detail)}
						on:move={({ detail }) => move_repeater_item(detail)}
						on:input={({ detail }) => {
							const row_id = detail.id || matching_content_row.id
							const data = detail.data || detail
							const updated_content = cloneDeep(
								content.map((row) =>
									row.id === row_id ? { ...row, ...(detail.data || detail) } : row
								)
							)
							console.log({ row_id, data, updated_content })
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
		/* padding-bottom: 1rem; */
		padding-block: 0.5rem;
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
			padding: 6rem;
			justify-content: center;
			margin-top: 12px;
		}
	}
</style>
