<script>
	import UI from '../../ui/index.js'
	import Icon from '@iconify/svelte'
	import { createEventDispatcher } from 'svelte'
	const dispatch = createEventDispatcher()

	export let field

	$: options = field.options?.options

	function update_option(updated_option, i) {
		const updated_options = options.map((opt, index) => (index === i ? updated_option : opt))
		dispatch_update(updated_options)
	}

	function dispatch_update(updated_options) {
		dispatch('input', { options: { ...field.options, options: updated_options } })
	}

	function validateFieldKey(key) {
		// replace dash and space with underscore
		return key.replace(/-/g, '_').replace(/ /g, '_').toLowerCase()
	}

	function moveOption(indexOfItem, direction) {
		const item = options[indexOfItem]
		const withoutItem = options.filter((_, i) => i !== indexOfItem)
		let updated_options
		if (direction === 'up') {
			updated_options = [
				...withoutItem.slice(0, indexOfItem - 1),
				item,
				...withoutItem.slice(indexOfItem - 1)
			]
		} else if (direction === 'down') {
			updated_options = [
				...withoutItem.slice(0, indexOfItem + 1),
				item,
				...withoutItem.slice(indexOfItem + 1)
			]
		} else {
			console.error('Direction must be up or down')
		}
		dispatch_update(updated_options)
		// dispatch('input', { options: { ...field.options, options: updated_options } })
	}

	function removeOption(itemIndex) {
		// field.options.options = field.options.options.filter((_, i) => i !== itemIndex)
		dispatch_update(field.options.options.filter((_, i) => i !== itemIndex))
		// dispatch('input')
	}

	// track focused value inputs to auto-fill values when unedited
	const clicked_value_inputs = new Set()
</script>

<!-- <div class="SelectField" style="margin-left: {1.5 + level}rem"> -->
<div class="SelectField">
	{#if options}
		{#each options as option, i}
			<div class="select-field">
				<UI.TextInput
					label="Option Label"
					value={option.label}
					on:input={({ detail }) => {
						// if (!clicked_value_inputs.has(i)) {
						// 	option.value = validateFieldKey(option.label)
						// }
						// const updated_options = options.map((opt, index) =>
						// 	index === i
						// 		? {
						// 				...opt,
						// 				value: clicked_value_inputs.has(i) ? option.value : validateFieldKey(detail),
						// 				label: detail
						// 		  }
						// 		: opt
						// )
						update_option(
							{
								...option,
								value: clicked_value_inputs.has(i) ? option.value : validateFieldKey(detail),
								label: detail
							},
							i
						)
						// dispatch_update(updated_options)
						// dispatch('input', e)
					}}
				/>
				<UI.TextInput
					label="Option Value"
					value={option.value}
					on:focus={() => clicked_value_inputs.add(i)}
					on:input={({ detail }) => {
						// option.value = validateFieldKey(option.value)
						// const updated_options = options.map((opt, index) =>
						// 	index === i
						// 		? {
						// 				...opt,
						// 				value: clicked_value_inputs.has(i) ? detail : validateFieldKey(detail)
						// 		  }
						// 		: opt
						// )
						// dispatch_update(updated_options)
						update_option(
							{
								...option,
								value: detail
							},
							i
						)
						// dispatch('input')
					}}
				/>
				<div class="item-options" id="repeater-{field.key}-{i}">
					{#if i !== 0}
						<button title="Move {field.label} up" on:click={() => moveOption(i, 'up')}>
							<Icon icon="fa-solid:arrow-up" />
						</button>
					{/if}
					{#if i !== options.length - 1}
						<button title="Move {field.label} down" on:click={() => moveOption(i, 'down')}>
							<Icon icon="fa-solid:arrow-down" />
						</button>
					{/if}
					<button
						style="color: var(--primo-color-danger)"
						title="Delete {field.label} item"
						on:click={() => removeOption(i)}
					>
						<Icon icon="ion:trash" />
					</button>
				</div>
			</div>
		{/each}
	{/if}
	<button
		class="field-button subfield-button"
		on:click={() => {
			if (!field.options?.options) {
				field.options = {
					options: [
						{
							label: '',
							value: ''
						}
					]
				}
			} else {
				field.options.options = [
					...field.options.options,
					{
						label: '',
						value: ''
					}
				]
			}
			dispatch('input')
		}}
	>
		<Icon icon="ic:baseline-plus" />
		Create Option
	</button>
</div>

<style lang="postcss">
	.SelectField {
		display: grid;
		gap: 1rem;
		margin-left: 1rem;
	}
	.select-field {
		display: grid;
		grid-template-columns: 1fr 1fr auto;
		grid-gap: 1rem;
		gap: 0.5rem;
	}
	.field-button {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		width: 100%;
		background: var(--color-gray-7);
		color: var(--color-gray-3);
		padding: 8px 0;
		border-bottom-right-radius: var(--border-radius);
		border-bottom-left-radius: var(--border-radius);
		transition: var(--transition-colors);
	}
	.field-button:hover {
		background: var(--color-gray-9);
	}
	.field-button.subfield-button {
		border-radius: 4px;
		/* margin-top: 8px;
		margin-bottom: 8px; */
		font-size: var(--font-size-2);
		background: var(--primo-color-codeblack);
		color: var(--color-gray-2);
		transition: var(--transition-colors);
		outline: 0;
	}
	.field-button.subfield-button:hover {
		background: var(--color-gray-8);
	}
	.field-button.subfield-button:focus {
		/* background: var(--color-gray-8); */
		border-color: var(--primo-color-brand);
		outline: 0;
	}
	.item-options {
		display: flex;
		align-items: center;
		margin-top: 15px; /* to align with inputs */
		justify-content: flex-end;
		/* gap: 0.25rem; */

		button {
			padding: 0.5rem 9px; /* align with inputs */
			transition: 0.1s;
			border-radius: var(--primo-border-radius);

			&:hover {
				background: var(--color-gray-8);
			}
		}
	}
</style>
