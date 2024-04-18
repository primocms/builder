<script>
	import Switch from '../ui/Switch.svelte'
	import { createEventDispatcher } from 'svelte'
	const dispatch = createEventDispatcher()

	export let field

	function toggleSwitch() {
		field.value = !field.value
		dispatch('input')
	}
</script>

<Switch label={field.label} value={field.value} on:input={toggleSwitch} />
