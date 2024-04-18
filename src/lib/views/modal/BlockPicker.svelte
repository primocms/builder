<script>
	import ModalHeader from '../../views/modal/ModalHeader.svelte'
	import BlockPicker from '../../components/BlockPicker.svelte'

	export let blocks, site, append, onsave

	let selected = []
</script>

<ModalHeader
	icon="lucide:blocks"
	title="Add Blocks to Site"
	button={{
		label: `Add ${selected.length} Blocks`,
		onclick: () => onsave(selected),
		icon: 'lucide:blocks',
		disabled: selected.length === 0
	}}
/>
<BlockPicker {blocks} {site} {append} bind:selected />
