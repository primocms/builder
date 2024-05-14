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
	import { Field_Row } from '../../../factories'
	import FieldItem from './FieldItem.svelte'

	export let fields

	$: parent_fields = fields.filter((f) => !f.parent)

	const dispatch = createEventDispatcher()

	function create_field() {
		const new_field = Field_Row({ index: parent_fields.length })
		const updated_fields = cloneDeep([...fields, new_field])
		dispatch('input', updated_fields)
		store_transaction({ action: 'insert', id: new_field.id, data: new_field })
	}

	function create_subfield(field) {
		const siblings = fields.filter((f) => f.parent === field.parent) // remove self, select siblings
		const new_field = Field_Row({ parent: field.id, index: siblings.length })
		const updated_fields = cloneDeep([...fields, new_field])
		dispatch('input', updated_fields)
		store_transaction({ action: 'insert', id: new_field.id, data: new_field })
	}

	function delete_field(field) {
		const updated_fields = cloneDeep(fields.filter((f) => f.id !== field.id))
		// get siblings, update indeces
		const updated_siblings = updated_fields
			.filter((f) => f.parent === field.parent) // remove self, select siblings
			.sort((a, b) => a.index - b.index)
			.map((f, i) => ({ ...f, index: i }))
		for (const sibling of updated_siblings) {
			const field = updated_fields.find((f) => f.id === sibling.id)
			field.index = sibling.index
		}
		dispatch('input', updated_fields)
		store_transaction({ action: 'delete', id: field.id })
	}

	let disabled = false

	function duplicate_field(field) {
		const new_field = Field_Row({
			...field,
			key: field.key + '_copy',
			label: field.label + ' copy'
		})
		const updated_fields = cloneDeep([...fields, new_field])

		// select siblings & self (could be root level)
		const children = updated_fields
			.filter((f) => f.parent === field.parent)
			.sort((a, b) => a.index - b.index)

		// update siblings & self w/ new indeces
		const updated_children = [
			...children.slice(0, field.index + 1),
			new_field,
			...children.slice(field.index + 1)
		].map((f, i) => ({ ...f, index: i }))

		// set updated_fields w/ updated indeces
		for (const child of updated_children) {
			const field = updated_fields.find((f) => f.id === child.id)
			field.index = child.index
		}

		dispatch('input', updated_fields)
		store_transaction({ action: 'insert', data: new_field })
		updated_children.forEach((child) =>
			store_transaction({ action: 'update', id: child.id, data: { index: child.index } })
		)
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
		dispatch('input', updated_fields)
		updated_children.forEach((child) =>
			store_transaction({ action: 'update', id: child.id, data: { index: child.index } })
		)
	}

	function update_field(updated_field) {
		const updated_fields = cloneDeep(
			fields.map((field) => (field.id === updated_field.id ? updated_field : field))
		)
		dispatch('input', updated_fields)
		store_transaction({ action: 'update', id: updated_field.id, data: updated_field })
	}

	let transactions = []
	function store_transaction({ action, id, data }) {
		const existing_transaction = transactions.find((transaction) => transaction.id === id)
		if (action === 'update' && existing_transaction) {
			existing_transaction.data = { ...existing_transaction.data, ...data }
		} else if (action === 'delete' && existing_transaction) {
			transactions = transactions.filter((t) => t.id !== existing_transaction.id)
		} else {
			transactions = [...transactions, { action, id, data }]
		}

		dispatch('transaction', { all: _.cloneDeep(transactions), action, id, data })
	}
</script>

<div class="Fields">
	{#each parent_fields.sort((a, b) => a.index - b.index) as field, index (field.id)}
		<FieldItem
			{fields}
			{field}
			child_fields={fields.filter((f) => f.parent === field.id)}
			on:duplicate={({ detail: field }) => duplicate_field(field)}
			on:delete={({ detail: field }) => delete_field(field)}
			on:move={({ detail }) => move_field(detail)}
			on:createsubfield={({ detail: field }) => create_subfield(field)}
			on:input={({ detail: field }) => update_field(field)}
		/>
	{/each}
	<button class="field-button" on:click={create_field} {disabled}>
		<div class="icon">
			<Icon icon="fa-solid:plus" />
		</div>
		<span>Add a Field</span>
	</button>
</div>

<style lang="postcss">
	.Fields {
		width: 100%;
		display: grid;
		gap: 1rem;
		padding-bottom: 1rem;
		color: var(--color-gray-2);
		height: 100%;
		overflow-y: auto;
		place-content: flex-start;
		justify-content: stretch;
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
