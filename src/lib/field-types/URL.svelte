<script>
	import UI from '../ui'

	export let field
</script>

<div>
	<UI.TextInput {...field} on:input bind:value={field.value} type="url" />
</div>

<style lang="postcss">
	div {
		width: 100%;
	}
</style>
