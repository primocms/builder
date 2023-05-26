<script>
	import Primo from '$lib/Primo.svelte'

	export let data
</script>

<Primo {data}>
	<slot />
</Primo>
