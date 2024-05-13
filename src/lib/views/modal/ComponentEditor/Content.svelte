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
	import Card from '../../../ui/Card.svelte'
	import { userRole, fieldTypes } from '../../../stores/app'
	import { is_regex } from '../../../utils'

	export let content
	export let fields

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

	function dispatch_update(content_row, updated_value) {
		console.log('dispatch_update', { content_row, updated_value })
		const updated_content = cloneDeep(
			content.map((row) => (row.id === content_row.id ? { ...row, value: updated_value } : row))
		)
		dispatch('input', {
			content: updated_content,
			row_id: content_row.id,
			value: updated_value
		})
		store_transaction({ id: content_row.id, data: { value: updated_value } })
	}

	let transactions = []
	function store_transaction({ id, data }) {
		// console.log({ action, data })
		const existing_transaction = transactions.find((transaction) => transaction.id === id)
		if (existing_transaction) {
			existing_transaction.data = data
		} else {
			transactions = [...transactions, { id, data }]
		}

		dispatch('transaction', { all: _.cloneDeep(transactions), id, data })

		// console.log('fields', { local_content, fields, transactions })
	}

	const root_fields = fields.filter((f) => !f.parent)
</script>

<div class="GenericFields">
	{#each root_fields.sort((a, b) => a.index - b.index) as field}
		{@const matching_content_row = content.find((r) => r.field === field.id)}
		{@const is_visible = check_condition(field)}
		{@const is_valid = (field.key || field.type === 'info') && getComponent(field)}
		{@const has_child_fields = field.type === 'repeater' || field.type === 'group'}
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
						id={matching_content_row?.id}
						value={matching_content_row?.value}
						subfields={fields.filter((f) => f.parent === field.id)}
						{fields}
						{content}
						on:save
						on:input={({ detail }) => dispatch_update(matching_content_row, detail)}
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
	.GenericFields {
		width: 100%;
		display: grid;
		gap: 1rem;
		padding-bottom: 1rem;
		color: var(--color-gray-2);
		background: var(--primo-color-black);
		/* min-width: 23rem; */
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
