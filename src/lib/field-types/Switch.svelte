<script>
	import Switch from '../ui/Switch.svelte'
	import { createEventDispatcher } from 'svelte'
	const dispatch = createEventDispatcher()

	export let field
	export let value

	function toggleSwitch() {
		// field.value = !field.value
		dispatch('input', !value)
	}
</script>

<Switch label={field.label} {value} on:input={toggleSwitch} />
