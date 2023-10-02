<script>
	import './reset.css'
	import { modal, fieldTypes, registerProcessors } from '$lib/index.js'
	import { browser } from '$app/environment'
	import Blog from './Blog.svelte'
	import Blog_Field_Type from './Blog_Field_Type.svelte'

	if (browser) {
		import('../lib/compiler/processors.js').then(({ html, css }) => {
			registerProcessors({ html, css })
		})
		modal.register({
			id: 'PLUGIN__BLOG',
			component: Blog,
			componentProps: {},
			options: {}
		})
		fieldTypes.register([
			{
				id: 'plugin--blog',
				label: 'Plugin: Blog',
				component: Blog_Field_Type
			}
		])
	}
</script>

<slot />
