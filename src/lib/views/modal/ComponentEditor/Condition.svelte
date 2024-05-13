<script>
	import Icon from '@iconify/svelte'
	import { createEventDispatcher } from 'svelte'
	const dispatch = createEventDispatcher()

	import UI from '../../../ui'

	export let field
	export let field_to_compare
	export let comparable_fields

	$: condition_value = field.options.condition?.value

	const comparisons = [
		{ icon: 'ph:equals-bold', label: 'Equals', value: '=' },
		{ icon: 'ph:not-equals-bold', label: `Doesn't equal`, value: '!=' }
	]
</script>

<div class="Condition">
	<p style="margin-bottom: 0.25rem; font-size: var(--font-size-1); color: #9d9d9d;">Condition</p>
	<div class="container">
		<!-- Sibling field to compare to -->
		<UI.Dropdown
			on:input={({ detail: field_id }) => {
				field.options.condition.field = field_id
				dispatch('input')
			}}
			icon={comparable_fields.find((f) => f.id === field.options.condition?.field)?.icon}
			label={comparable_fields.find((f) => f.id === field.options.condition?.field)?.label ||
				'Field'}
			options={comparable_fields.map((f) => ({
				label: f.label,
				value: f.id,
				disabled: f.options.condition
			}))}
		/>
		<!-- Comparison -->
		<UI.Dropdown
			on:input={({ detail: comparison }) => {
				field.options.condition.comparison = comparison
				dispatch('input')
			}}
			label={comparisons.find((c) => c.value === field.options.condition?.comparison)?.label}
			icon={comparisons.find((c) => c.value === field.options.condition?.comparison)?.icon}
			options={comparisons}
		/>
		<!-- Value -->
		{#if field_to_compare?.type === 'select'}
			<UI.Dropdown
				label={condition_value || field_to_compare.options?.options[0]?.id}
				on:input={({ detail: value }) => {
					field.options.condition.value = value
					dispatch('input')
				}}
				options={field_to_compare.options?.options?.map((option) => ({
					value: option.id,
					label: option.label
				}))}
			/>
		{:else if field_to_compare?.type === 'switch'}
			<UI.Switch
				value={field.options.condition?.value}
				on:input={() => {
					field.options.condition.value = !field.options.condition?.value
					dispatch('input')
				}}
			/>
		{:else}
			<UI.TextInput
				placeholder="Value"
				value={condition_value || ''}
				on:input={({ detail: value }) => {
					field.options.condition.value = value
					dispatch('input')
				}}
			/>
		{/if}
		<!-- Delete -->
		<button
			class="delete"
			on:click={() => {
				field.options.condition = null
				dispatch('input')
			}}
		>
			<Icon icon="ion:trash" />
		</button>
	</div>
</div>

<style>
	.container {
		display: grid;
		grid-template-columns: auto auto 1fr auto;
		gap: 0.5rem;
		place-items: center;
	}
	.delete {
		height: 100%;
		padding-inline: 10px;
		border: 1px solid var(--color-gray-7);
		border-radius: 0.25rem;
		font-size: 0.75rem;

		&:hover {
			border: 1px solid #c62828;
			transition: 0.1s;
			color: #c62828;
		}
	}
</style>
