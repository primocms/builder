import { find, cloneDeep, some } from 'lodash-es'
import _ from 'lodash-es'
import { get } from 'svelte/store'
import { goto } from '$app/navigation'
import * as active_page_store from './app/active_page'
import page_type from './app/active_page_type.js'
import { locale } from './app/misc'
import stores, { update_timeline } from './data'
import { update as update_site, content as site_content, site } from './data/site'
import { timeline } from './data'
import { buildStaticPage } from './helpers'
import { dataChanged, storageChanged } from '../database'
import { swap_array_item_index } from '../utilities'
import { getEmptyValue } from '../utils'
import { v4 as uuidv4 } from 'uuid'
import { Page, Page_Type, Symbol, Section } from '../factories'
import { page } from '$app/stores'

/**
 * Hydrates the active site, page, section, and symbol stores for the editor
 * @param {import('$lib').Site_Data} data - Combined data object from the server
 */
export async function hydrate_active_data(data) {
	// stores.sections.set(data.sections)
	stores.pages.set(data.pages)
	stores.page_types.set(data.page_types)
	stores.symbols.set(data.symbols)
	update_site(data.site)
}

/** @returns {void} */
export function undo_change() {
	const { current } = get(timeline)
	current?.undoing(current.data)
	timeline.undo()
}

/** @returns {void} */
export function redo_change() {
	const { data, doing } = timeline.redo()
	doing(data)
}

export const symbols = {
	create: async (symbol, changes, index = 0) => {
		await update_timeline({
			doing: async () => {
				console.log({ symbol, changes })

				// insert symbol row
				// insert symbol field rows
				// insert symbol content rows

				// stores.symbols.update((store) => [...store.slice(0, index), symbol, ...store.slice(index)])

				const symbol_db_id = await dataChanged({
					table: 'symbols',
					action: 'insert',
					data: {
						name: symbol.name,
						code: symbol.code,
						index,
						site: get(site).id
					}
				})

				stores.symbols.update((store) => [
					...store.slice(0, index),
					{ ...symbol, id: symbol_db_id },
					...store.slice(index)
				])

				const fields_db_ids = {}
				for (const { action, id, data } of changes.fields) {
					console.log('update fields', {
						fields_db_ids: cloneDeep(fields_db_ids),
						action,
						id,
						data
					})
					const db_id = await dataChanged({
						table: 'fields',
						action,
						id: fields_db_ids[id],
						data: {
							...data,
							parent: fields_db_ids[data.parent] || null,
							symbol: symbol_db_id
						}
					})
					if (db_id) {
						fields_db_ids[id] = db_id
					}
				}

				const content_db_ids = {}
				for (const { action, id, data } of changes.content) {
					console.log('update content', {
						fields_db_ids,
						content_db_ids: cloneDeep(content_db_ids),
						action,
						id,
						data
					})

					const db_id = await dataChanged({
						table: 'content',
						action,
						id,
						data: {
							...data,
							field: fields_db_ids[data.field] || null,
							symbol: symbol_db_id,
							parent: content_db_ids[data.parent] || null
						}
					})
					if (db_id) {
						content_db_ids[data.id] = db_id
					}
				}

				await symbols.rearrange(get(stores.symbols))
			},
			undoing: async () => {
				stores.symbols.update((store) => store.filter((s) => s.id !== symbol.id))
				await dataChanged({
					table: 'symbols',
					action: 'delete',
					id: symbol.id
				})
				await symbols.rearrange(get(stores.symbols))
			}
		})
	},
	update: async (updated_symbol_id, updated_symbol_props) => {
		const original_symbols = _.cloneDeep(get(stores.symbols))
		const original_symbol = _.cloneDeep(
			original_symbols.find((symbol) => symbol.id === updated_symbol_id)
		)
		const original_sections = _.cloneDeep(get(stores.sections))

		// TODO: get updated content rows
		// separate fields into rows (no parent)

		console.log({ updated_symbol_props })

		await update_timeline({
			doing: async () => {
				stores.symbols.update((store) =>
					store.map((symbol) =>
						symbol.id === updated_symbol_id ? { ...symbol, ...updated_symbol_props } : symbol
					)
				)
				dataChanged({
					table: 'symbols',
					action: 'update',
					data: updated_symbol_props,
					id: updated_symbol_id
				})
			},
			undoing: async () => {
				stores.symbols.set(original_symbols)
				stores.sections.set(original_sections)
				await dataChanged({
					table: 'symbols',
					action: 'update',
					data: original_symbol,
					id: original_symbol.id
				})
			}
		})
	},
	delete: async (symbol_to_delete) => {
		const original_symbols = _.cloneDeep(get(stores.symbols))
		const original_sections = _.cloneDeep(get(stores.sections))

		let deleted_sections

		await update_timeline({
			doing: async () => {
				stores.sections.update((store) =>
					store.filter((section) => section.symbol !== symbol_to_delete.id)
				)
				stores.symbols.update((symbols) => symbols.filter((s) => s.id !== symbol_to_delete.id))

				deleted_sections = await dataChanged({
					table: 'sections',
					action: 'delete',
					match: { symbol: symbol_to_delete.id }
				})
				await dataChanged({
					table: 'symbols',
					action: 'delete',
					id: symbol_to_delete.id
				})
			},
			undoing: async () => {
				stores.symbols.set(original_symbols)
				stores.sections.set(original_sections)
				await dataChanged({
					table: 'symbols',
					action: 'insert',
					data: symbol_to_delete
				})
				await dataChanged({
					table: 'sections',
					action: 'insert',
					data: deleted_sections
				})
			}
		})
	},
	rearrange: async (rearranged_symbols) => {
		const rearranged_symbols_with_indeces = rearranged_symbols.map((symbol, i) => ({
			...symbol,
			index: i
		}))
		await update_timeline({
			doing: async () => {
				stores.symbols.set(rearranged_symbols_with_indeces)
				await Promise.all(
					rearranged_symbols_with_indeces.map((symbol) => {
						dataChanged({
							table: 'symbols',
							action: 'update',
							id: symbol.id,
							data: { index: symbol.index }
						})
					})
				)
			},
			undoing: async () => {
				stores.sections.set(original_sections)
				await dataChanged({ table: 'sections', action: 'delete', id: new_section.id })
				await dataChanged({
					table: 'sections',
					action: 'upsert',
					data: original_sections.map((s) => ({ ...s, symbol: s.symbol }))
				})
			}
		})
	}
}

export const active_site = {
	update: async (props) => {
		update_site(props)
		await dataChanged({
			table: 'sites',
			action: 'update',
			data: props,
			id: get(site)['id']
		})
	}
}

export const active_page = {
	add_block: async (symbol, position) => {
		const original_sections = _.cloneDeep(get(stores.sections))

		const { data } = get(page)

		// if adding to page type, also add section to every instance of section
		let new_section
		if (data.page_type) {
			// // adding to page type
			// new_section = Section({
			// 	index: position,
			// 	page: null,
			// 	page_type: data.page_type.id,
			// 	// content: symbol.content,
			// 	symbol: symbol.id
			// })
		} else {
			// adding to page
			new_section = Section({
				index: position,
				page: get(active_page_store.id),
				symbol: symbol.id
			})
		}

		await update_timeline({
			doing: async () => {
				const updated_sections = [
					...original_sections.slice(0, position),
					{
						...new_section,
						content: symbol.content.map((row) => ({
							...row,
							symbol: null,
							section: new_section.id
						}))
					},
					...original_sections.slice(position)
				].map((section, i) => ({ ...section, index: i }))

				// is page type, copy sections to pages of type
				if (data.page_type) {
					// // fetch pages with given page type
					// const page_instances = await dataChanged({
					// 	table: 'pages',
					// 	action: 'select',
					// 	match: { page_type: data.page_type.id }
					// })
					// // add new section with given page type
					// await Promise.all(
					// 	page_instances?.map(async (page) => {
					// 		await dataChanged({
					// 			table: 'sections',
					// 			action: 'insert',
					// 			data: Section({
					// 				index: position,
					// 				content: symbol.content,
					// 				symbol: symbol.id,
					// 				page: page.id,
					// 				page_type: null,
					// 				master: new_section.id
					// 			})
					// 		})
					// 	})
					// )
				}

				stores.sections.set(updated_sections)

				// upload new section, update local section w/ new ID
				const new_section_db_id = await dataChanged({
					table: 'sections',
					action: 'insert',
					data: {
						index: new_section.index,
						symbol: new_section.symbol,
						page: new_section.page
					}
				})
				_.find(updated_sections, { id: new_section.id }).id = new_section_db_id
				stores.sections.set(updated_sections)

				// add content items for section
				const old_content_ids = symbol.content.map((r) => r.id)
				const new_content_ids = await dataChanged({
					table: 'content',
					action: 'insert',
					data: symbol.content.map((row) => ({
						value: row.value,
						index: row.index,
						// parent: row.parent,
						metadata: row.metadata,
						locale: row.locale,
						field: row.field,
						section: new_section_db_id
					}))
				})

				// TODO: handle transferring repeater items

				// update local content IDs
				let updated_section_content = _.find(updated_sections, { id: new_section_db_id }).content
				updated_section_content = updated_section_content.map((row, i) => {
					const parent_index = old_content_ids.indexOf(row.parent)
					return {
						...row,
						id: new_content_ids[i]['id'],
						parent: new_content_ids[parent_index]?.id || null
					}
				})
				stores.sections.set(updated_sections)

				// update section content w/ parents using db IDs
				await dataChanged({
					table: 'content',
					action: 'upsert',
					data: updated_section_content
						.filter((s) => s.parent)
						.map((s) => ({ id: s.id, parent: s.parent }))
				})

				// update indeces of sibling sections
				await dataChanged({
					table: 'sections',
					action: 'upsert',
					data: updated_sections.map((s) => ({ id: s.id, index: s.index }))
				})
			},
			undoing: async () => {
				// TODO: inverse
				// stores.sections.set(original_sections)
				// await dataChanged({ table: 'sections', action: 'delete', id: new_section.id })
				// await dataChanged({
				// 	table: 'sections',
				// 	action: 'upsert',
				// 	data: original_sections
				// })
			}
		})
		update_page_preview()
	},
	add_primo_block: async (symbol, position) => {
		const original_sections = _.cloneDeep(get(stores.sections))

		const new_symbol = {
			id: uuidv4(),
			name: symbol.name,
			index: position,
			site: get(site).id,
			code: symbol.code,
			content: symbol.content,
			fields: symbol.fields
		}

		// apply site languages to symbol
		for (let language in get(site_content)) {
			if (!new_symbol.hasOwnProperty(language)) {
				// Set the corresponding language in the 'symbol.content' object
				new_symbol.content[language] = new_symbol.content['en']
			}
		}

		const new_section = {
			id: uuidv4(),
			index: position,
			page: get(active_page_store).id,
			content: symbol.content,
			symbol: new_symbol.id
		}

		const new_sections = [
			...original_sections.slice(0, position),
			new_section,
			...original_sections.slice(position)
		].map((section, i) => ({ ...section, index: i }))

		await update_timeline({
			doing: async () => {
				stores.symbols.update((store) => [
					...store.slice(0, position),
					new_symbol,
					...store.slice(position)
				])
				stores.sections.set(new_sections)

				await dataChanged({ table: 'symbols', action: 'insert', data: new_symbol })
				await dataChanged({
					table: 'sections',
					action: 'upsert',
					data: new_sections.map((s) => ({ ...s, symbol: s.symbol }))
				})
			},
			undoing: async () => {
				stores.symbols.update((store) => store.filter((s) => s.id !== new_symbol.id))
				stores.sections.set(original_sections)

				await dataChanged({ table: 'sections', action: 'delete', id: new_section.id })
				await dataChanged({
					table: 'sections',
					action: 'upsert',
					data: original_sections.map((s) => ({ ...s, symbol: s.symbol }))
				})
				await dataChanged({ table: 'symbols', action: 'delete', id: new_symbol.id })
			}
		})
		update_page_preview()
	},
	move_block: async (block_being_moved, to) => {
		const block_being_replaced = _.find(get(stores.sections), ['index', to])

		const original_sections = cloneDeep(get(stores.sections))
		const updated_sections = swap_array_item_index(
			get(stores.sections),
			block_being_moved.index,
			to
		).map((section) => {
			if (section.id === block_being_moved.id) {
				return {
					...section,
					index: to
				}
			} else if (section.id === block_being_replaced?.id) {
				return {
					...section,
					index: block_being_moved.index
				}
			} else return section
		})

		await update_timeline({
			doing: async () => {
				stores.sections.set(updated_sections)
				if (!block_being_replaced) return
				await Promise.all([
					dataChanged({
						table: 'sections',
						action: 'update',
						id: block_being_replaced.id,
						data: { index: block_being_moved.index }
					}),
					dataChanged({
						table: 'sections',
						action: 'update',
						id: block_being_moved.id,
						data: { index: to }
					})
				])
			},
			undoing: async () => {
				stores.sections.set(original_sections)
				await Promise.all([
					dataChanged({
						table: 'sections',
						action: 'update',
						id: block_being_replaced.id,
						data: { index: block_being_replaced.index }
					}),
					dataChanged({
						table: 'sections',
						action: 'update',
						id: block_being_moved.id,
						data: { index: block_being_moved.index }
					})
				])
			}
		})
		update_page_preview()
	},
	duplicate_block: async (block_id) => {
		const block = get(stores.sections).find((section) => section.id === block_id)
		const position = block.index + 1
		const original_sections = _.cloneDeep(get(stores.sections))

		const new_block = {
			...block,
			id: uuidv4()
		}

		const new_sections = [
			...original_sections.slice(0, position),
			new_block,
			...original_sections.slice(position)
		].map((section, i) => ({ ...section, index: i }))

		await update_timeline({
			doing: async () => {
				stores.sections.set(new_sections)
				await dataChanged({ table: 'sections', action: 'upsert', data: new_sections })
			},
			undoing: async () => {
				stores.sections.set(original_sections)
				await dataChanged({ table: 'sections', action: 'delete', id: new_block.id })
				await dataChanged({ table: 'sections', action: 'upsert', data: original_sections })
			}
		})
		update_page_preview()
	},
	delete_block: async (block_id) => {
		const original_sections = _.cloneDeep(get(stores.sections))
		const block = original_sections.find((section) => section.id === block_id)
		const new_sections = original_sections
			.filter((section) => section.id !== block_id)
			.map((section, i) => ({ ...section, index: i }))

		await update_timeline({
			doing: async () => {
				stores.sections.set(new_sections)
				await dataChanged({ table: 'sections', action: 'delete', id: block_id })
				await dataChanged({
					table: 'sections',
					action: 'upsert',
					data: new_sections.map((s) => ({ id: s.id, index: s.index }))
				})
			},
			undoing: async () => {
				stores.sections.set(original_sections)
				await dataChanged({ table: 'sections', action: 'insert', data: block })
				await dataChanged({
					table: 'sections',
					action: 'upsert',
					data: original_sections.map((s) => ({ id: s.id, index: s.index }))
				})
			}
		})
		update_page_preview()
	},
	update: async ({ obj, is_page_type = false }) => {
		const current_page = _.cloneDeep(get(active_page_store.default))
		await update_timeline({
			doing: async () => {
				active_page.set(obj)
				await dataChanged({
					table: is_page_type ? 'page_types' : 'pages',
					action: 'update',
					id: current_page.id,
					data: obj
				})
			},
			undoing: async () => {
				active_page.set(current_page)
				await dataChanged({
					table: 'pages',
					action: 'update',
					id: current_page.id,
					data: current_page
				})
			}
		})
		update_page_preview()
	}
}

export const page_types = {
	/** @param {{ details: { id: string, name: string, url: string, parent: string | null}, source: string | null }} new_page */
	create: async ({ details }) => {
		const original_pages = cloneDeep(get(stores.pages))
		console.log({ details })

		let db_id
		await update_timeline({
			doing: async () => {
				stores.page_types.update((store) => [...store, details])
				db_id = await dataChanged({
					table: 'page_types',
					action: 'insert',
					data: {
						...details,
						code: { head: '', foot: '' },
						site: get(site)['id']
					}
				})
			},
			undoing: async () => {
				// TODO: test
				console.log({ db_id })
				stores.pages.set(original_pages)
				await dataChanged({ table: 'page_types', action: 'delete', id: db_id })
			}
		})
		console.log({ db_id })
		return db_id
	},
	delete: async (page_type_id) => {
		const original_page_types = cloneDeep(get(stores.page_types))
		const updated_page_types = original_page_types.filter(
			(page_type) => page_type.id !== page_type_id
		)
		let deleted_sections = []
		let deleted_page_types = original_page_types.filter(
			(page_type) => page_type.id === page_type_id
		)

		await update_timeline({
			doing: async () => {
				stores.page_types.set(updated_page_types)
				await dataChanged({ table: 'page_types', action: 'delete', id: page_type_id })

				// Go to home page if active page is deleted
				if (get(active_page_store).id === page_type_id) {
					await goto(`/${get(site)['url']}`)
				}
			},
			undoing: async () => {
				stores.page_types.set(original_page_types)
				await dataChanged({ table: 'page_types', action: 'insert', data: deleted_page_types })
				await dataChanged({ table: 'sections', action: 'insert', data: deleted_sections })
			}
		})
	},
	update: async (page_id, obj) => {
		const original_page = cloneDeep(get(stores.page_types).find((page) => page.id === page_id))
		const current_page_types = cloneDeep(get(stores.page_types))
		const updated_page_types = current_page_types.map((page) =>
			page.id === page_id ? { ...page, ...obj } : page
		)
		stores.page_types.set(updated_page_types)
		await update_timeline({
			doing: async () => {
				stores.page_types.set(updated_page_types)
				await dataChanged({ table: 'page_types', action: 'update', id: page_id, data: obj })
			},
			undoing: async () => {
				stores.page_types.set(current_page_types)
				await dataChanged({
					table: 'page_types',
					action: 'update',
					id: page_id,
					data: original_page
				})
			}
		})
	}
}

export const pages = {
	/** @param {import('$lib').Page} new_page */
	create: async (new_page) => {
		const original_pages = cloneDeep(get(stores.pages))

		let new_sections = []

		// TODO: insert static blocks
		// // page has a page type
		// // fetch sections from page type
		// const res = await dataChanged({
		// 	table: 'sections',
		// 	action: 'select',
		// 	match: { page_type: new_page.page_type.id }
		// })
		// new_sections = res?.map((section) => ({
		// 	...section,
		// 	id: uuidv4(), // recreate with unique IDs
		// 	page: new_page.id, // attach to new page
		// 	page_type: null, // remove attachment to page type (?)
		// 	master: section.id // attach to master blocks
		// }))

		await update_timeline({
			doing: async () => {
				console.log({ new_page })
				stores.pages.update((store) => [...store, new_page])
				await dataChanged({
					table: 'pages',
					action: 'insert',
					data: {
						name: new_page.name,
						slug: new_page.slug,
						page_type: new_page.page_type?.id,
						index: new_page.index,
						parent: new_page.parent
					}
				})
				// await dataChanged({
				// 	table: 'sections',
				// 	action: 'insert',
				// 	data: new_sections
				// })
			},
			undoing: async () => {
				stores.pages.set(original_pages)
				await dataChanged({ table: 'pages', action: 'delete', id: new_page.id })
			}
		})
	},
	delete: async (page_id) => {
		const original_pages = cloneDeep(get(stores.pages))
		const updated_pages = original_pages.filter(
			(page) => page.id !== page_id && page.parent !== page_id
		)
		let deleted_sections = []
		let deleted_pages = original_pages.filter(
			(page) => page.id === page_id || page.parent === page_id
		)

		await update_timeline({
			doing: async () => {
				stores.pages.set(updated_pages)

				// Delete page
				const sections_to_delete = await dataChanged({
					table: 'sections',
					action: 'select',
					match: { page: page_id }
				})
				deleted_sections = sections_to_delete
					? [...deleted_sections, ...sections_to_delete]
					: deleted_sections
				await dataChanged({ table: 'pages', action: 'delete', id: page_id })

				// Go to home page if active page is deleted
				if (get(active_page_store.id) === page_id) {
					await goto(`/${get(site)['url']}`)
				}
			},
			undoing: async () => {
				stores.pages.set(original_pages)
				await dataChanged({ table: 'pages', action: 'insert', data: deleted_pages })
				await dataChanged({ table: 'sections', action: 'insert', data: deleted_sections })
			}
		})
	},
	update: async (page_id, obj) => {
		const original_page = cloneDeep(get(stores.pages).find((page) => page.id === page_id))
		const current_pages = cloneDeep(get(stores.pages))
		const updated_pages = current_pages.map((page) =>
			page.id === page_id ? { ...page, ...obj } : page
		)
		stores.pages.set(updated_pages)
		await update_timeline({
			doing: async () => {
				stores.pages.set(updated_pages)
				await dataChanged({ table: 'pages', action: 'update', id: page_id, data: obj })
			},
			undoing: async () => {
				stores.pages.set(current_pages)
				await dataChanged({ table: 'pages', action: 'update', id: page_id, data: original_page })
			}
		})
	}
}

// temporarily disable preview page for non-index pages
// in the future, we'll enable page previews with cloud compilation instead of storing previews
export async function update_page_preview(page = get(active_page_store.default)) {
	if (page.url === 'index') {
		const preview = await buildStaticPage({ page, no_js: true })
		// await storageChanged({
		// 	bucket: 'sites',
		// 	action: 'upload',
		// 	key: `${get(stores.site).id}/${page.id}/index.html`,
		// 	file: preview.html,
		// 	options: { upsert: true }
		// })
		await storageChanged({
			bucket: 'sites',
			action: 'upload',
			key: `${get(stores.site).id}/preview.html`,
			file: preview.html,
			options: { upsert: true }
		})
	}
	// else {
	//   await storageChanged({
	//     bucket: 'sites',
	//     action: 'upload',
	//     key: `${get(stores.site).id}/${page.id}/index.html`,
	//     file: preview.html,
	//     options: { upsert: true }
	//   })
	// }
}

export async function update_section(
	section_id,
	{ field_transactions, content_transactions, updated_code, updated_fields, updated_content }
) {
	console.log({
		field_transactions,
		content_transactions,
		updated_code,
		updated_fields,
		updated_content
	})

	const original_sections = _.cloneDeep(get(stores.sections))
	const original_section = original_sections.find((section) => section.id === section_id)
	const original_symbols = _.cloneDeep(get(stores.symbols))
	const original_symbol = original_symbols.find((symbol) => symbol.id === original_section.symbol)

	await update_timeline({
		doing: async () => {
			// Get updated content items which don't have a matching field in the original symbol's content
			const new_symbol_content = _.cloneDeep(
				updated_content.filter((section_content_row) => {
					const symbol_has_matching_field_content_row = original_symbol.content.some(
						(symbol_row) => {
							// no field, is repeater item
							if (!section_content_row.field) {
								const parent_repeater_container = updated_content.find(
									(r) => r.id === section_content_row.parent
								)
								const parent_field_matches = symbol_row.field === parent_repeater_container.field
								return parent_field_matches
							}
							const field_matches = symbol_row.field === section_content_row.field
							if (field_matches) {
								return true
							}
						}
					)
					if (!symbol_has_matching_field_content_row) {
						console.log('symbol does not have this field yet, add it', { section_content_row })
						return true
					} else {
						console.log('symbol already has this field, dont add it', { section_content_row })
						return false
					}
				})
			)

			const remaining_symbol_content = _.cloneDeep(
				original_symbol.content.filter((symbol_content_row) => {
					const section_has_matching_field_content_row = updated_content.some(
						(updated_content_row) => updated_content_row.field === symbol_content_row.field
					)
					if (section_has_matching_field_content_row) {
						console.log('updated content has this field, include it', { symbol_content_row })
						return true
					} else {
						console.log('updated content does not have this field, remove it', {
							symbol_content_row
						})
						return false
					}
				})
			)
			console.log({
				updated_content,
				original_symbol,
				original_section,
				remaining_symbol_content,
				new_symbol_content,
				code: updated_code,
				fields: updated_fields
			})

			// STORE: update symbol content (for new fields), fields, and code
			// TODO: handle new repeater items
			stores.symbols.update((store) =>
				store.map((symbol) =>
					symbol.id === original_symbol.id
						? {
								...symbol,
								content: [...remaining_symbol_content, ...new_symbol_content],
								code: updated_code,
								fields: updated_fields
						  }
						: symbol
				)
			)

			// STORE: update section content
			stores.sections.update((store) =>
				store.map((section) =>
					section.id === section_id ? { ...section, content: updated_content } : section
				)
			)

			// DB: save symbol code
			await dataChanged({
				table: 'symbols',
				action: 'update',
				id: original_symbol.id,
				data: {
					code: updated_code
				}
			})

			// DB: save symbol fields
			const new_field_ids = {} // store id's of newly created fields for new children to reference
			for (const { action, id, data } of field_transactions) {
				const parent_db_id = new_field_ids[data?.parent] || data?.parent || null

				if (action === 'insert') {
					// const old_id = data.id
					// delete data.id
					const new_id = await dataChanged({
						table: 'fields',
						action,
						data: {
							...data,
							parent: parent_db_id,
							symbol: original_symbol.id
						}
					})
					new_field_ids[data.id] = new_id
				} else {
					// delete data?.id
					await dataChanged({
						id: new_field_ids[id] || id,
						table: 'fields',
						action,
						data: {
							...data,
							parent: parent_db_id
						}
					})
				}
			}

			// DB: save new symbol content
			const new_symbol_content_ids = {}
			for (const new_row of new_symbol_content) {
				// delete new_row.section
				const db_id = await dataChanged({
					table: 'content',
					action: 'insert',
					data: {
						value: new_row.value,
						index: new_row.index,
						metadata: new_row.metadata,
						locale: new_row.locale,
						field: new_field_ids[new_row.field],
						// parent: new_content_ids[new_row.parent],
						symbol: original_symbol.id
					}
				})
				new_symbol_content_ids[new_row.id] = db_id
			}

			// DB: update symbol content w/ parent DB IDs (TODO: test)
			await dataChanged({
				table: 'content',
				action: 'upsert',
				data: new_symbol_content
					.filter((r) => r.parent)
					.map((row) => ({
						id: new_symbol_content_ids[row.id],
						parent: new_symbol_content_ids[row.parent]
					}))
			})

			// DB: save section content
			const new_content_ids = {}
			for (const { action, id, data } of content_transactions) {
				const item_db_id = new_content_ids[id] || id
				const parent_db_id = new_content_ids[data.parent] || data.parent || null
				const field_db_id = new_field_ids[data.field] || data.field
				if (action === 'insert') {
					// delete data.id
					console.log({ new_content_ids, new_field_ids })

					const db_id = await dataChanged({
						table: 'content',
						action,
						data: {
							...data,
							field: field_db_id,
							parent: parent_db_id,
							section: section_id
						}
					})
					new_content_ids[data.id] = db_id
				} else {
					console.log({ new_content_ids })
					await dataChanged({
						table: 'content',
						action,
						id: item_db_id,
						data: {
							...data,
							parent: parent_db_id,
							field: field_db_id
						}
					})
				}
			}

			// STORE: update symbol fields & content locally w/ DB IDs
			stores.symbols.update((store) =>
				store.map((symbol) => {
					if (symbol.id === original_symbol.id) {
						const fields_with_updated_ids = symbol.fields.map((field) => ({
							...field,
							id: new_field_ids[field.id] || field.id,
							parent: new_field_ids[field.parent] || field.parent
						}))
						const content_with_updated_ids = symbol.content.map((row) => ({
							...row,
							id: new_symbol_content_ids[row.id] || row.id,
							parent: new_symbol_content_ids[row.parent] || row.parent,
							field: new_field_ids[row.field] || row.field
						}))
						return { ...symbol, fields: fields_with_updated_ids, content: content_with_updated_ids }
					} else return symbol
				})
			)

			// STORE: update section content locally w/ DB IDs
			stores.sections.update((store) =>
				store.map((section) => {
					if (section.id === section_id) {
						const content_with_updated_ids = section.content.map((row) => ({
							...row,
							id: new_content_ids[row.id] || row.id,
							parent: new_content_ids[row.parent] || row.parent,
							field: new_field_ids[row.field] || row.field
						}))
						return { ...section, content: content_with_updated_ids }
					} else return section
				})
			)
		},
		undoing: async () => {
			// TODO: do reverse
			// stores.symbols.set(original_symbols)
			// stores.sections.set(original_sections)
			// await dataChanged({
			// 	table: 'symbols',
			// 	action: 'update',
			// 	data: original_symbol,
			// 	id: original_symbol.id
			// })
		}
	})
}

export async function add_page_type_section(symbol, position) {
	console.log({ symbol, position })
	const original_sections = _.cloneDeep(get(active_page).sections)

	let new_section = Section({
		index: position,
		page_type: get(active_page).id,
		symbol: symbol.id
	})

	await update_timeline({
		doing: async () => {
			const updated_sections = [
				...original_sections.slice(0, position),
				{
					...new_section,
					content: symbol.content.map((row) => ({
						...row,
						symbol: null,
						section: new_section.id
					}))
				},
				...original_sections.slice(position)
			].map((section, i) => ({ ...section, index: i }))

			// is page type, copy sections to pages of type
			// fetch pages with given page type
			const page_instances = await dataChanged({
				table: 'pages',
				action: 'select',
				data: 'id',
				match: { page_type: get(active_page).id }
			})
			// add new section with given page type
			await Promise.all(
				page_instances?.map(async (page) => {
					await dataChanged({
						table: 'sections',
						action: 'insert',
						data: Section({
							index: position,
							content: symbol.content,
							symbol: symbol.id,
							page: page.id,
							page_type: null,
							master: new_section.id
						})
					})
				})
			)

			stores.sections.set(updated_sections)

			// upload new section, update local section w/ new ID
			const new_section_db_id = await dataChanged({
				table: 'sections',
				action: 'insert',
				data: {
					index: new_section.index,
					symbol: new_section.symbol,
					page: new_section.page
				}
			})
			_.find(updated_sections, { id: new_section.id }).id = new_section_db_id
			stores.sections.set(updated_sections)

			// add content items for section
			const old_content_ids = symbol.content.map((r) => r.id)
			const new_content_ids = await dataChanged({
				table: 'content',
				action: 'insert',
				data: symbol.content.map((row) => ({
					value: row.value,
					index: row.index,
					// parent: row.parent,
					metadata: row.metadata,
					locale: row.locale,
					field: row.field,
					section: new_section_db_id
				}))
			})

			// TODO: handle transferring repeater items

			// update local content IDs
			let updated_section_content = _.find(updated_sections, { id: new_section_db_id }).content
			updated_section_content = updated_section_content.map((row, i) => {
				const parent_index = old_content_ids.indexOf(row.parent)
				return {
					...row,
					id: new_content_ids[i]['id'],
					parent: new_content_ids[parent_index]?.id || null
				}
			})
			stores.sections.set(updated_sections)

			// update section content w/ parents using db IDs
			await dataChanged({
				table: 'content',
				action: 'upsert',
				data: updated_section_content
					.filter((s) => s.parent)
					.map((s) => ({ id: s.id, parent: s.parent }))
			})

			// update indeces of sibling sections
			await dataChanged({
				table: 'sections',
				action: 'upsert',
				data: updated_sections.map((s) => ({ id: s.id, index: s.index }))
			})
		},
		undoing: async () => {
			// TODO: inverse
			// stores.sections.set(original_sections)
			// await dataChanged({ table: 'sections', action: 'delete', id: new_section.id })
			// await dataChanged({
			// 	table: 'sections',
			// 	action: 'upsert',
			// 	data: original_sections
			// })
		}
	})
	update_page_preview()
}

export async function update_page_type_fields({ changes, fields }) {
	await update_timeline({
		doing: async () => {
			page_type.update((store) => ({ ...store, fields }))
			for (const { action, id, data } of changes) {
				if (action === 'insert') {
					// overwrite original id w/ db id to register further updates
					const original_id = data.id
					delete data.id
					const res = await dataChanged({
						table: 'fields',
						action: 'insert',
						data: { ...data, page_type: get(page_type).id }
					})
					page_type.update((store) => ({
						...store,
						fields: fields.map((f) => (f.id === original_id ? { ...f, id: res } : f))
					}))
					// add content rows to each page of this type (TODO: better way to do this than fetching first?)
					const pages_of_type = await dataChanged({
						table: 'pages',
						action: 'select',
						data: 'id',
						match: { page_type: get(page_type).id }
					})
					console.log({ pages_of_type, res })
					await dataChanged({
						table: 'content',
						action: 'insert',
						data: pages_of_type.map((p) => ({ page: p.id, field: res, value: getEmptyValue(data) }))
					})
				} else {
					await dataChanged({
						table: 'fields',
						action,
						id,
						data: { ...data, page_type: get(page_type).id }
					})
				}
			}
		},
		undoing: async () => {
			// TODO: do the inverse
		}
	})
}

export async function update_page_content({ changes, content }) {
	await update_timeline({
		doing: async () => {
			active_page_store.content.set(content)
			for (const { action, id, data } of changes) {
				await dataChanged({
					table: 'content',
					action,
					id,
					data: { ...data, page: get(active_page_store.id) }
				})
			}
		},
		undoing: async () => {
			// TODO: do the inverse
		}
	})
}

// toggle symbol in page type
export async function toggle_symbol_for_page_type({ symbol_id, page_type_id, toggled }) {
	await update_timeline({
		doing: async () => {
			await dataChanged({
				table: 'symbols',
				action: 'update',
				id: symbol_id,
				data: {
					page_type: toggled ? page_type_id : null
				}
			})
		},
		undoing: async () => {
			await dataChanged({
				table: 'symbols',
				action: 'update',
				id: symbol_id,
				data: {
					page_type: toggled ? null : page_type_id
				}
			})
		}
	})
}

// extract symbol/instance content from updated section content
export async function update_section_content(section, { key, value, locale }) {
	const symbol = get(stores.symbols).find((symbol) => symbol.id === section.symbol)

	let matching_field
	let repeater_item = null
	if (Array.isArray(key)) {
		const [repeater_key, index, subfield_key] = key
		const { id: repeater_field_id } = symbol.fields.find((f) => f.key === repeater_key && !f.parent)
		const { id: container_id } = section.content.find((r) => r.field === repeater_field_id)
		repeater_item = section.content.find((r) => r.parent === container_id && r.index === index)
		matching_field = symbol.fields.find(
			(f) => f.key === subfield_key && f.parent === repeater_field_id
		)
	} else if (typeof key === 'object') {
		const { id: parent_id } = symbol.fields.find((f) => f.key === key.parent && !f.parent)
		matching_field = symbol.fields.find((f) => f.key === key.child && f.parent === parent_id)
	} else {
		matching_field = symbol.fields.find((field) => field.key === key)
	}
	console.log({ matching_field, repeater_item, content: section.content })

	const original_symbol_content = _.cloneDeep(symbol.content)
	const original_section_content = _.cloneDeep(section.content)

	await update_timeline({
		doing: async () => {
			await dataChanged({
				table: 'content',
				action: 'update',
				match: {
					section: section.id,
					field: matching_field.id,
					// index: repeater_item,
					locale,
					parent: repeater_item.id
				},
				data: { value }
			})

			// TODO: update locally (maybe no need since page doesn't remount)
			// const updated_section_content = _.cloneDeep(section.content)
			// stores.sections.update((store) =>
			// 	store.map((s) => (s.id === section.id ? { ...s, content: updated_section_content } : s))
			// )
		},
		undoing: async () => {
			const original_value = _.get(original_section_content, `${locale}.${key}`)
			console.log({ original_value, original_section_content, locale, key })
			await dataChanged({
				table: 'content',
				action: 'update',
				match: { section: section.id, field: matching_field.id, locale },
				data: { value: original_value }
			})
			stores.sections.update((store) =>
				store.map((s) => (s.id === section.id ? { ...s, content: original_section_content } : s))
			)
		}
	})
	update_page_preview()
}

export async function add_language(key) {
	await update_timeline({
		doing: async () => {
			site_content.update((s) => ({
				...s,
				[key]: s['en']
			}))

			stores.pages.update((store) =>
				store.map((page) => ({
					...page,
					content: {
						...page.content,
						[key]: page.content['en']
					}
				}))
			)

			stores.symbols.update((store) =>
				store.map((symbol) => ({
					...symbol,
					content: {
						...symbol.content,
						[key]: symbol.content['en']
					}
				}))
			)

			stores.sections.update((store) =>
				store.map((section) => ({
					...section,
					content: {
						...section.content,
						[key]: section.content['en']
					}
				}))
			)

			// add language to page, site, and sections content
			await Promise.all([
				await dataChanged({
					table: 'sites',
					action: 'update',
					id: get(site)['id'],
					data: {
						content: {
							...get(site).content,
							[key]: get(site).content['en']
						}
					}
				}),
				...get(stores.symbols).map(async (symbol) => {
					await dataChanged({
						table: 'symbols',
						action: 'update',
						id: symbol.id,
						data: {
							content: {
								...symbol.content,
								[key]: symbol.content['en']
							}
						}
					})
				}),
				...get(stores.pages).map(async (page) => {
					await dataChanged({
						table: 'sections',
						action: 'select',
						match: { page: page.id },
						order: ['index', { ascending: true }]
					}).then(async (all_sections) => {
						all_sections.map(async (section) => {
							await dataChanged({
								table: 'sections',
								action: 'update',
								id: section.id,
								data: {
									content: {
										...section.content,
										[key]: section.content['en']
									}
								}
							})
						})
					}),
						await dataChanged({
							table: 'pages',
							action: 'update',
							id: page.id,
							data: {
								content: {
									...page.content,
									[key]: page.content['en']
								}
							}
						})
				})
			])
		},
		undoing: async () => {
			locale.set('en')

			site_content.update((s) => {
				delete s[key]
				return s
			})

			stores.pages.update((store) =>
				store.map((page) => {
					delete page.content[key]
					return page
				})
			)

			stores.sections.update((store) =>
				store.map((section) => {
					delete section.content[key]
					return section
				})
			)

			stores.symbols.update((store) =>
				store.map((symbol) => {
					delete symbol.content[key]
					return symbol
				})
			)

			await Promise.all([
				await dataChanged({
					table: 'sites',
					action: 'update',
					id: get(site)['id'],
					data: {
						content: get(site_content)
					}
				}),
				...get(stores.sections).map(async (section) => {
					await dataChanged({
						table: 'sections',
						action: 'update',
						id: section.id,
						data: {
							content: section.content
						}
					})
				}),
				...get(stores.pages).map(async (page) => {
					await dataChanged({
						table: 'sections',
						action: 'select',
						match: { page: page.id },
						order: ['index', { ascending: true }]
					}).then(async (all_sections) => {
						all_sections.map(async (section) => {
							delete section.content[key]
							await dataChanged({
								table: 'sections',
								action: 'update',
								id: section.id,
								data: {
									content: section.content
								}
							})
						})
					})

					await dataChanged({
						table: 'pages',
						action: 'update',
						id: page.id,
						data: {
							content: page.content
						}
					})
				})
			])
		}
	})
}

export async function delete_language(key) {
	locale.set('en')

	const original = {
		site_content: _.cloneDeep(get(site_content)),
		pages: _.cloneDeep(get(stores.pages)),
		sections: _.cloneDeep(get(stores.sections)),
		symbols: _.cloneDeep(get(stores.symbols))
	}

	update_timeline({
		doing: async () => {
			site_content.update((s) => {
				delete s[key]
				return s
			})

			stores.pages.update((store) =>
				store.map((page) => {
					delete page.content[key]
					return page
				})
			)

			stores.sections.update((store) =>
				store.map((section) => {
					delete section.content[key]
					return section
				})
			)

			stores.symbols.update((store) =>
				store.map((symbol) => {
					delete symbol.content[key]
					return symbol
				})
			)

			await Promise.all([
				await dataChanged({
					table: 'sites',
					action: 'update',
					id: get(site)['id'],
					data: {
						content: get(site_content)
					}
				}),
				...get(stores.sections).map(async (section) => {
					await dataChanged({
						table: 'sections',
						action: 'update',
						id: section.id,
						data: {
							content: section.content
						}
					})
				}),
				...get(stores.pages).map(async (page) => {
					await dataChanged({
						table: 'pages',
						action: 'update',
						id: page.id,
						data: {
							content: page.content
						}
					})
				})
			])
		},
		undoing: async () => {
			site_content.set(original.site_content)
			stores.pages.set(original.pages)
			stores.sections.set(original.sections)
			stores.symbols.set(original.symbols)

			await Promise.all([
				await dataChanged({
					table: 'sites',
					action: 'update',
					id: get(site)['id'],
					data: {
						content: get(site_content)
					}
				}),
				await dataChanged({
					table: 'sections',
					action: 'upsert',
					data: get(stores.sections).map((section) => ({
						id: section.id,
						content: section.content
					}))
				}),
				await dataChanged({
					table: 'pages',
					action: 'upsert',
					data: get(stores.pages).map((page) => ({
						id: page.id,
						content: page.content
					}))
				})
			])
		}
	})
}

export async function set_language(loc) {
	locale.set(loc)
}

export default {
	active_site,
	active_page,
	pages,
	update_page_preview,
	update_section_content,
	add_language,
	delete_language,
	set_language
}
