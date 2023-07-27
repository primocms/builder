<script>
	import { PrimoPage } from '$lib/index.js'

	export let data
</script>

<PrimoPage
	page={{
		...data.page,
		sections: data.sections
	}}
/>
