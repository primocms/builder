<script>
	import { createEventDispatcher, onMount } from 'svelte'
	const dispatch = createEventDispatcher()

	export let block
	console.log({ block })
	onMount(() => {
		dispatch('mount')
	})
</script>

SYMBOL PALETTE
