<script>
	import UI from '../ui'

	export let field
	export let value
</script>

<div>
	<UI.TextInput {...field} {value} on:input type="url" />
</div>

<style lang="postcss">
	div {
		width: 100%;
	}
</style>
