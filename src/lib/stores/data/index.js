import _ from 'lodash-es'
import { createStack } from '../../libraries/svelte-undo'
import site from './site'
import pages from './pages'
import page_types from './page_types'
import sections from './sections'
import symbols from './symbols'

export default {
	site,
	pages,
	page_types,
	sections,
	symbols
}

export let timeline = createStack({
	doing: () => {
		console.log('initial doing')
	},
	undoing: () => {
		console.log('initial undoing')
	}
})

/** @param {{ doing: () => Promise<void>, undoing: () => Promise<void> }} functions */
export async function update_timeline({ doing, undoing }) {
	await doing()
	timeline.push({
		doing,
		undoing
	})
}
