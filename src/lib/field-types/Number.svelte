<script>
	import { createEventDispatcher } from 'svelte'
	const dispatch = createEventDispatcher()

	import UI from '../ui'

	export let field
	export let value
</script>

<div>
	<UI.TextInput
		{...field}
		{value}
		on:input={({ detail }) => dispatch('input', { value: detail })}
		type="number"
	/>
</div>

<style lang="postcss">
	div {
		width: 100%;
	}
</style>
