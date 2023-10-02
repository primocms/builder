<script>
	import { createEventDispatcher, tick } from 'svelte'
	const dispatch = createEventDispatcher()

	// Next:
	// Put plugin files in directory, share state with store
	// Sync store with db row: plugin id, data, created, updated, site
	// Add plugin by pulling from npm or adding under 'plugins' in dashboard

	export let field

	let active_article = { title: null, content: null }

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
	$: field.value = active_article

	if (!field.label) {
		field.label = 'Blog'
	}
	if (!field.key) {
		field.key = 'blog'
	}
	$: console.log(field.value)

	async function select_article(article) {
		active_article = article
		await tick()
		dispatch('input')
	}
</script>

<main class="Blog primo-reset">
	<select
		on:change={({ target }) => select_article(articles.find((a) => a.title === target.value))}
	>
		{#each articles as article}
			<option value={article.title}>{article.title}</option>
		{/each}
	</select>
</main>

<style>
	.Blog.primo-reset {
		display: grid;
		gap: 1rem;
	}
</style>
