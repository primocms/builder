<script>
	import PrimoPage from '$lib/views/editor/Page.svelte'

	export let data
</script>

<PrimoPage
	page={{
		...data.page,
		sections: data.sections
	}}
/>
