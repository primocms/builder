<script>
	import ModalHeader from '$lib/views/modal/ModalHeader.svelte'

	let active_article

	let articles = [
		{
			title: 'First Article',
			content: ''
		},
		{
			title: 'Second Article',
			content: ''
		},
		{
			title: 'Third Article',
			content: ''
		}
	]
	$: console.log({ articles })
</script>

<ModalHeader
	svg={`<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="2.5" y="2.5" width="5" height="5" rx="0.5" fill="#CECECE" stroke="#CECECE"/><rect x="10.5" y="2.5" width="5" height="5" rx="0.5" fill="#CECECE" stroke="#CECECE"/><rect x="2.5" y="10.5" width="5" height="5" rx="0.5" fill="#CECECE" stroke="#CECECE"/><rect x="10.5" y="10.5" width="5" height="5" rx="0.5" fill="#CECECE" stroke="#CECECE"/></svg>`}
	title="Blog"
/>

<main class="Blog primo-reset">
	<nav style="display:grid;place-items: start;gap:0.5rem;">
		{#each articles as article}
			<button on:click={() => (active_article = article)}>{article.title}</button>
		{/each}
	</nav>
	{#key active_article}
		<textarea
			style="padding: 0.5rem;width:100%;"
			value={active_article?.content || ''}
			on:input={({ target }) => {
				console.log(target.value)
				articles = articles.map((a) =>
					active_article.title === a.title
						? {
								...a,
								content: target.value
						  }
						: a
				)
			}}
		/>
	{/key}
</main>

<style>
	.Blog.primo-reset {
		background: var(--primo-color-black);
		padding: 1.125rem 2rem;
		display: grid;
		gap: 1rem;
		grid-template-columns: auto 1fr;
	}
</style>
