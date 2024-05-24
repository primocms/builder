<script>
	import UI from '../ui'
	import { tick, createEventDispatcher } from 'svelte'
	const dispatch = createEventDispatcher()

	export let field
	export let value

	if (!field?.options?.options) {
		field.options = {
			options: []
		}
	}

	// input doesn't fire immediately for some reason
	tick().then(() => {
		if (!value) {
			dispatch('input', { value: field.options.options[0]?.value })
		}
	})

	$: options = field.options.options
</script>

<div class="SelectField">
	{#if options.length > 0}
		<UI.Select
			fullwidth={true}
			label={field.label}
			{options}
			{value}
			on:input={({ detail: value }) => dispatch('input', { value })}
		/>
	{:else}
		<span>This field doesn't have any options</span>
	{/if}
</div>

<style lang="postcss">
	.SelectField {
		width: 100%;
	}
</style>
