<script>
	import { fade } from 'svelte/transition'
	import _ from 'lodash-es'
	import Icon from '@iconify/svelte'
	import { processCode, processCSS } from '../utils'
	import { locale } from '../stores/app/misc'
	import IFrame from '../components/IFrame.svelte'

	export let symbol
	export let site
	export let append = ''
	export let checked = false

	let name_el

	// move cursor to end of name
	$: if (name_el) {
		const range = document.createRange()
		const sel = window.getSelection()
		range.setStart(name_el, 1)
		range.collapse(true)

		sel?.removeAllRanges()
		sel?.addRange(range)
	}

	let renaming = false
	async function toggle_name_input() {
		renaming = !renaming
		// workaround for inability to see cursor when div empty
		if (symbol.name === '') {
			symbol.name = 'Block'
		}
	}

	let height = 0

	let componentCode
	let cachedSymbol = {}
	let component_error
	$: compile_component_code(symbol, $locale)
	async function compile_component_code(symbol, language) {
		if (
			_.isEqual(cachedSymbol.code, symbol.code) &&
			_.isEqual(cachedSymbol.content, symbol.content)
		) {
			return
		}

		const parent_css = await processCSS(site.code.css)
		let res = await processCode({
			component: {
				...symbol.code,
				head: site.code.html.head,
				css: parent_css + symbol.code.css,
				html: `
          ${symbol.code.html}`,
				data: symbol.content[language]
			},
			buildStatic: true,
			hydrated: true
		})
		if (res.error) {
			component_error = res.error
		} else {
			component_error = null
			res.css = res.css + parent_css
			componentCode = res
			cachedSymbol = _.cloneDeep({ code: symbol.code, content: symbol.content })
		}
	}
</script>

<button class="sidebar-symbol" on:click>
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<div class="symbol" on:mousedown on:mouseup>
		{#if checked}
			<div class="check" in:fade={{ duration: 100 }}>
				<Icon icon="material-symbols:check" />
			</div>
		{/if}
		{#if component_error}
			<div class="error">
				<Icon icon="bxs:error" />
			</div>
		{:else}
			{#key componentCode}
				<IFrame bind:height {append} {componentCode} />
			{/key}
		{/if}
	</div>
</button>

<style lang="postcss">
	.sidebar-symbol {
		width: 100%;
		--IconButton-opacity: 0;

		&:hover:not(.dragging) {
			--IconButton-opacity: 1;
		}

		.symbol {
			width: 100%;
			border-radius: 0.25rem;
			overflow: hidden;
			position: relative;
			min-height: 2rem;
			transition: box-shadow 0.2s;
			border: 1px solid var(--color-gray-8);
		}
	}
	.check {
		position: absolute;
		inset: 0;
		z-index: 9;
		background: rgba(0, 0, 0, 0.9);
		font-size: 3rem;
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--primo-color-brand);
	}
	.error {
		display: flex;
		justify-content: center;
		height: 100%;
		position: absolute;
		inset: 0;
		align-items: center;
		background: #ff0000;
	}
</style>
