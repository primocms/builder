<script>
	import autosize from 'autosize'
	import { onMount } from 'svelte'
	import { createEventDispatcher } from 'svelte'
	import TextInput from '../ui/TextInput.svelte'

	const dispatch = createEventDispatcher()

	export let field
	export let value
	export let disabled = false
	export let title = null
	export let autofocus = false

	function selectAll({ target }) {
		if (field.default === field.value) target.select()
	}

	let element
	onMount(() => {
		autosize(element)
	})
</script>

<TextInput
	{...field}
	{value}
	{disabled}
	{title}
	grow={true}
	{autofocus}
	on:focus={selectAll}
	on:keydown
	on:input={({ detail }) => {
		dispatch('input', { value: detail })
	}}
/>

<style lang="postcss">
</style>
