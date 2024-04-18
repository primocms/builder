<script context="module">
	import { writable } from 'svelte/store'

	const leftPaneSize = writable('33%')
	const centerPaneSize = writable('33%')
	const rightPaneSize = writable('33%')

	const activeTabs = writable({
		html: true,
		css: true,
		js: true
	})

	const CodeMirror = writable(null)
	if (!import.meta.env.SSR) {
		import('../../../components/CodeEditor/CodeMirror.svelte').then((module) => {
			CodeMirror.set(module.default)
			fetch_dev_libraries()
		})
	}

	let libraries
	async function fetch_dev_libraries() {
		libraries = {
			prettier: await import('prettier'),
			prettier_css: (await import('prettier/esm/parser-postcss')).default,
			prettier_babel: (await import('prettier/esm/parser-babel')).default,
			prettier_svelte: (await import('$lib/libraries/prettier/prettier-svelte')).default
		}
	}
</script>

<script>
	import { fade } from 'svelte/transition'
	import Icon from '@iconify/svelte'
	import { createEventDispatcher } from 'svelte'
	const dispatch = createEventDispatcher()
	import * as Mousetrap from 'mousetrap'

	import HSplitPane from './HSplitPane.svelte'
	import { onMobile, showKeyHint } from '../../../stores/app/misc'

	export let variants = ''

	export let data = {}

	export let html = ''
	export let css = ''
	export let js = ''

	if (!import.meta.env.SSR) {
		Mousetrap.bind(['mod+1'], () => toggleTab(0))
		Mousetrap.bind(['mod+2'], () => toggleTab(1))
		Mousetrap.bind(['mod+3'], () => toggleTab(2))
	}

	let activeTab = 0

	let selections = {
		html: 0,
		css: 0,
		js: 0
	}

	function toggleTab(tab) {
		const tabName = {
			0: 'html',
			1: 'css',
			2: 'js'
		}[tab]
		$activeTabs = {
			...$activeTabs,
			[tabName]: !$activeTabs[tabName]
		}

		const nActive = Object.values($activeTabs).filter(Boolean).length
		if (!nActive) return
		const panelWidth = 100 / nActive
		$leftPaneSize = $activeTabs['html'] ? `${panelWidth}%` : '0'
		$centerPaneSize = $activeTabs['css'] ? `${panelWidth}%` : '0'
		$rightPaneSize = $activeTabs['js'] ? `${panelWidth}%` : '0'
	}

	// close empty tabs
	if (!css && $activeTabs['css']) {
		toggleTab(1)
	}
	if (!js && $activeTabs['js']) {
		toggleTab(2)
	}

	let showing_format_button = true
	async function format_all_code() {
		html = format(html, 'svelte', libraries.prettier_svelte)
		css = format(css, 'css', libraries.prettier_css)
		js = format(js, 'babel', libraries.prettier_babel)
	}

	function format(code, mode, plugin) {
		let formatted
		try {
			formatted = libraries.prettier.format(code, {
				parser: mode,
				bracketSameLine: true,
				plugins: [plugin]
			})
		} catch (e) {
			console.warn(e)
		}
		return formatted
	}
</script>

{#if $onMobile}
	<div class="mobile-tabs {variants}">
		<div class="tabs">
			<ul>
				<li class:is-active={activeTab === 0}>
					<button on:click={() => (activeTab = 0)}>
						<span>HTML</span>
					</button>
				</li>
				<li class:is-active={activeTab === 1}>
					<button on:click={() => (activeTab = 1)}>
						<span>CSS</span>
					</button>
				</li>
				<li class:is-active={activeTab === 2}>
					<button on:click={() => (activeTab = 2)}>
						<span>JS</span>
					</button>
				</li>
			</ul>
		</div>
		{#if $CodeMirror}
			{#if activeTab === 0}
				<svelte:component
					this={$CodeMirror}
					mode="html"
					docs="https://docs.primo.so/development#html"
					{data}
					bind:value={html}
					bind:selection={selections['html']}
					on:tab-switch={() => toggleTab(0)}
					on:change={() => {
						dispatch('htmlChange')
					}}
					on:format={() => {
						showing_format_button = false
					}}
					on:save
					on:refresh
				/>
			{:else if activeTab === 1}
				<svelte:component
					this={$CodeMirror}
					on:tab-switch={() => toggleTab(1)}
					bind:selection={selections['css']}
					bind:value={css}
					mode="css"
					docs="https://docs.primo.so/development#css"
					on:change={() => {
						dispatch('cssChange')
					}}
					on:format={() => {
						showing_format_button = false
					}}
					on:save
					on:refresh
				/>
			{:else}
				<svelte:component
					this={$CodeMirror}
					on:tab-switch={() => toggleTab(2)}
					bind:selection={selections['js']}
					bind:value={js}
					docs="https://docs.primo.so/development#javascript"
					mode="javascript"
					on:change={() => {
						dispatch('jsChange')
					}}
					on:format={() => (showing_format_button = false)}
					on:save
					on:refresh
				/>
			{/if}
		{/if}
	</div>
{:else}
	<HSplitPane
		hideLeftOverflow={true}
		bind:leftPaneSize={$leftPaneSize}
		bind:centerPaneSize={$centerPaneSize}
		bind:rightPaneSize={$rightPaneSize}
	>
		<div slot="left" class="tabs">
			<button class:tab-hidden={$leftPaneSize <= '0'} on:click={() => toggleTab(0)}>
				{#if $showKeyHint}
					<span>&#8984; 1</span>
				{:else}
					<span>HTML</span>
				{/if}
			</button>
			{#if $CodeMirror}
				<svelte:component
					this={$CodeMirror}
					mode="html"
					docs="https://docs.primo.so/development#html"
					{data}
					bind:value={html}
					bind:selection={selections['html']}
					on:tab-switch={({ detail }) => toggleTab(detail)}
					on:change={() => {
						// showing_format_button = true
						dispatch('htmlChange')
					}}
					on:format={() => (showing_format_button = false)}
					on:save
					on:refresh
				/>
			{/if}
		</div>
		<div slot="center" class="tabs">
			<button class:tab-hidden={$centerPaneSize <= '0'} on:click={() => toggleTab(1)}>
				{#if $showKeyHint}
					<span>&#8984; 2</span>
				{:else}
					<span>CSS</span>
				{/if}
			</button>
			{#if $CodeMirror}
				<svelte:component
					this={$CodeMirror}
					on:tab-switch={({ detail }) => toggleTab(detail)}
					bind:selection={selections['css']}
					bind:value={css}
					mode="css"
					docs="https://docs.primo.so/development#css"
					on:change={() => {
						// showing_format_button = true
						dispatch('cssChange')
					}}
					on:format={() => (showing_format_button = false)}
					on:save
					on:refresh
				/>
			{/if}
		</div>
		<div slot="right" class="tabs">
			<button class:tab-hidden={$rightPaneSize <= '0'} on:click={() => toggleTab(2)}>
				{#if $showKeyHint}
					<span>&#8984; 3</span>
				{:else}
					<span>JS</span>
				{/if}
			</button>
			{#if $CodeMirror}
				<svelte:component
					this={$CodeMirror}
					on:tab-switch={({ detail }) => toggleTab(detail)}
					bind:selection={selections['js']}
					bind:value={js}
					mode="javascript"
					docs="https://docs.primo.so/development#javascript"
					on:change={() => {
						// showing_format_button = true
						dispatch('jsChange')
					}}
					on:format={() => (showing_format_button = false)}
					on:save
					on:refresh
				/>
			{/if}
		</div>
	</HSplitPane>
{/if}

<footer>
	{#if showing_format_button}
		<button on:click={() => format_all_code()} transition:fade={{ duration: 100 }}>
			<Icon icon="carbon:clean" />
			<span>Format</span>
		</button>
	{/if}
	<a target="blank" href={'https://docs.primocms.org/development'}>
		<span>Docs</span>
		<Icon icon="mdi:external-link" />
	</a>
</footer>

<style lang="postcss">
	[slot] {
		width: 100%;
		display: flex;
		flex-direction: column;
	}

	.mobile-tabs {
		display: flex;
		flex-direction: column;
		overflow: scroll;

		ul {
			color: var(--color-gray-2);
			border: 1px solid var(--color-gray-9);
		}
	}

	.tabs {
		height: 100%;
		position: relative;

		button {
			background: var(--color-gray-9);
			color: var(--primo-color-white);
			width: 100%;
			text-align: center;
			padding: 8px 0;
			outline: 0;
			font-size: var(--font-size-1);
			font-weight: 700;
			z-index: 10;

			&.tab-hidden {
				height: 100%;
				position: absolute;
				background: #111;
				transition: background 0.1s, color 0.1s;

				&:hover {
					background: var(--primo-color-brand);
					color: var(--primo-color-codeblack);
				}

				span {
					transform: rotate(270deg);
					display: block;
				}
			}
		}

		ul {
			display: flex;
			justify-content: space-around;

			li {
				flex: 1;
				background: var(--color-gray-9);
				font-size: var(--font-size-1);
				font-weight: 700;
			}
		}
	}

	.tabs ul li:first-child {
		border-top-left-radius: 5px;
	}
	.tabs ul li:last-child {
		border-top-right-radius: 5px;
	}

	.tabs ul li.is-active {
		background: var(--primo-color-codeblack);
		color: var(--primo-color-white);
	}

	footer {
		position: sticky;
		bottom: 0.25rem;
		left: 100%;
		margin-right: 0.25rem;
		display: flex;
		justify-content: flex-end;
		gap: 0.25rem;
		z-index: 99;
		pointer-events: none;

		a,
		button {
			color: var(--color-gray-2);
			background: var(--color-gray-9);
			transition: 0.1s background;
			padding: 0.25rem 0.5rem;
			font-size: 0.75rem;
			display: inline-flex;
			align-items: center;
			gap: 0.25rem;

			&:hover {
				background: var(--color-gray-8);
			}
		}
	}
</style>
