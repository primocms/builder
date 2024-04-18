<script>
	import Icon from '@iconify/svelte'

	/** @type {string} */
	export let variant = 'dots'

	const icon = {
		dots: 'eos-icons:three-dots-loading',
		loop: 'line-md:loading-twotone-loop'
	}[variant]
</script>

<div class="Spinner">
	<Icon {icon} />
</div>

<style>
	.Spinner {
		font-size: var(--Spinner-font-size);
		padding: var(--Spinner-padding);
	}
</style>
