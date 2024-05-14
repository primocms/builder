<script>
	import { find as _find, chain as _chain } from 'lodash-es'
	import { createEventDispatcher } from 'svelte'
	import { slide } from 'svelte/transition'
	import Icon from '@iconify/svelte'
	import { fieldTypes } from '../stores/app'

	const dispatch = createEventDispatcher()

	export let field
	export let subfields
	export let fields
	export let content
	export let level = 0

	let hidden = false

	function getFieldComponent(subfield) {
		const field = _find($fieldTypes, ['id', subfield.type])
		return field ? field.component : null
	}
</script>

<div class="group-field group-level-{level}">
	{#if level > 0}
		<button on:click={() => (hidden = !hidden)}>
			<span>{field.label}</span>
			<Icon icon={hidden ? 'ph:caret-up-bold' : 'ph:caret-down-bold'} />
		</button>
	{/if}
	{#if !hidden}
		<div class="group-entries" transition:slide|local={{ duration: 100 }}>
			{#each subfields as subfield}
				{@const { id, value } = content.find((r) => r.field === subfield.id)}
				<div class="group-item">
					<svelte:component
						this={getFieldComponent(subfield)}
						field={subfield}
						{value}
						level={level + 1}
						{fields}
						{content}
						on:input={({ detail }) => {
							if (detail.id) {
								dispatch('input', detail)
							} else {
								dispatch('input', { id, data: detail })
							}
						}}
					/>
				</div>
			{/each}
		</div>
	{/if}
</div>

<style lang="postcss">
	.group-field {
		display: grid;
		gap: 0.75rem;
	}
	button {
		display: flex;
		justify-content: space-between;
		gap: 1rem;
		padding: 1rem;
		padding-left: 0;

		span {
			font-size: var(--title-font-size);
			font-weight: var(--title-font-size);
		}

		& + .group-entries {
			border-top: var(--input-border);
			padding-top: 2rem;
		}
	}
	.group-level-1 {
		padding-left: 1.5rem;
		border-left: 0.5rem solid var(--field-border-color, #252627);
	}
	.group-item {
		/* background: var(--color-gray-9); */
		margin-bottom: 0.25rem;

		&:only-child {
			padding: 0.5rem;
		}

		padding-left: 0;
		--label-font-size: 0.75rem;
		--label-font-weight: 400;
	}

	.group-entries {
		display: grid;
		gap: 1rem;
	}
</style>
