import { find, cloneDeep, some } from 'lodash-es'
import _ from 'lodash-es'
import { get } from 'svelte/store'
import { goto } from '$app/navigation'
import * as activePage from './app/activePage'
import { id as activePageID } from './app/activePage'
import { locale } from './app/misc'
import stores, { update_timeline } from './data'
import { update as update_site, content as site_content, site } from './data/site'
import { timeline } from './data'
import { buildStaticPage } from './helpers'
import {dataChanged, storageChanged} from '$lib/database'
import { swap_array_item_index } from '$lib/utilities'
import { v4 as uuidv4 } from 'uuid';
import {Page} from '../const'

/**
 * Hydrates the active site, page, section, and symbol stores for th editor
 * @param {import('$lib').Site_Data} data - Combined data object from the server
 */
export async function hydrate_active_data(data) {
  // stores.sections.set(data.sections)
  stores.pages.set(data.pages)
  stores.symbols.set(data.symbols)
  update_site(data.site)
}

/** @returns {void} */
export function undo_change() {
  const { current } = get(timeline)
  current?.undoing(current.data)
  timeline.undo();
}

/** @returns {void} */
export function redo_change() {
  const { data, doing } = timeline.redo()
  doing(data)
}

export const symbols = {
  create: async (symbol, index = 0) => {
    await update_timeline({
      doing: async () => {

        // apply site languages to symbol
        for (let language in get(site_content)) {
          if (!symbol.hasOwnProperty(language)) {
              // Set the corresponding language in the 'symbol.content' object
              symbol.content[language] = symbol.content['en']
          }
        }
        stores.symbols.update(store => [
          ...store.slice(0, index),
          symbol,
          ...store.slice(index)
        ])
        await dataChanged({
          table: 'symbols',
          action: 'insert',
          data: symbol
        })
      },
      undoing: async () => {
        stores.symbols.update(store => store.filter(s => s.id !== symbol.id))
        await dataChanged({
          table: 'symbols',
          action: 'delete',
          id: symbol.id
        })
      }
    })
  },
  update: async (updated_symbol) => {

    const original_symbols = _.cloneDeep(get(stores.symbols))
    const original_symbol = _.cloneDeep(original_symbols.find(symbol => symbol.id === updated_symbol.id))
    const original_sections = _.cloneDeep(get(stores.sections))

    if (_.isEqual(original_symbol, updated_symbol)) return
    await update_timeline({
      doing: async () => {

        stores.symbols.update(store => store.map(symbol => symbol.id === updated_symbol.id ? { ...symbol, ...updated_symbol } : symbol))

        dataChanged({
          table: 'symbols',
          action: 'update',
          data: updated_symbol,
          id: updated_symbol.id
        })
      },
      undoing: async () => {
        stores.symbols.set(original_symbols)
        stores.sections.set(original_sections)
        await dataChanged({
          table: 'symbols',
          action: 'update',
          data: original_symbol,
          id: updated_symbol.id
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
        stores.sections.update(store => store.filter(section => section.symbol !== symbol_to_delete.id))
        
        deleted_sections = await dataChanged({
          table: 'sections',
          action: 'delete',
          match: { symbol: symbol_to_delete.id }
        })

        stores.symbols.update(symbols => symbols.filter(s => s.id !== symbol_to_delete.id))
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

    const new_section = {
      id: uuidv4(),
      index: position,
      page: get(activePageID),
      content: symbol.content,
      symbol: symbol.id
    }

    const new_sections = [
      ...original_sections.slice(0, position),
      new_section,
      ...original_sections.slice(position)
    ].map((section, i) => ({ ...section, index: i }))

    await update_timeline({
      doing: async () => {
        stores.sections.set(new_sections)
        await dataChanged({ table: 'sections', action: 'upsert', data: new_sections.map(s => ({ ...s, symbol: s.symbol })) })
      },
      undoing: async () => {
        stores.sections.set(original_sections)
        await dataChanged({ table: 'sections', action: 'delete', id: new_section.id })
        await dataChanged({ table: 'sections', action: 'upsert', data: original_sections.map(s => ({ ...s, symbol: s.symbol })) })
      }
    })
    update_page_preview()
  },
  add_primo_block: async (symbol, position) => {
    const original_sections = _.cloneDeep(get(stores.sections))

    const new_symbol = {
      ...symbol,
      id: uuidv4(),
      site: get(site).id
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
      page: get(activePageID),
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
        stores.symbols.update(store => [
          ...store.slice(0, position),
          new_symbol,
          ...store.slice(position)
        ])
        stores.sections.set(new_sections)

        await dataChanged({ table: 'symbols', action: 'insert', data: new_symbol })
        await dataChanged({ table: 'sections', action: 'upsert', data: new_sections.map(s => ({ ...s, symbol: s.symbol })) })
      },
      undoing: async () => {
        stores.symbols.update(store => store.filter(s => s.id !== new_symbol.id))
        stores.sections.set(original_sections)

        await dataChanged({ table: 'sections', action: 'delete', id: new_section.id })
        await dataChanged({ table: 'sections', action: 'upsert', data: original_sections.map(s => ({ ...s, symbol: s.symbol })) })
        await dataChanged({ table: 'symbols', action: 'delete', id: new_symbol.id })
      }
    })
    update_page_preview()
  },
  move_block: async (block_being_moved, to) => {
    const block_being_replaced = _.find(get(stores.sections), ['index', to])

    const original_sections = cloneDeep(get(stores.sections))
    const updated_sections = swap_array_item_index(get(stores.sections), block_being_moved.index, to).map((section) => {
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
          dataChanged({ table: 'sections', action: 'update', id: block_being_replaced.id, data: { index: block_being_moved.index } }),
          dataChanged({ table: 'sections', action: 'update', id: block_being_moved.id, data: { index: to } })
        ])
      },
      undoing: async () => {
        stores.sections.set(original_sections)
        await Promise.all([
          dataChanged({ table: 'sections', action: 'update', id: block_being_replaced.id, data: { index: block_being_replaced.index } }),
          dataChanged({ table: 'sections', action: 'update', id: block_being_moved.id, data: { index: block_being_moved.index }})
        ])
      }
    })
    update_page_preview()
  },
  duplicate_block: async (block, position) => {
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
        await dataChanged({ table: 'sections', action: 'upsert', data: new_sections.map(s => ({ ...s, symbol: s.symbol })) })
      },
      undoing: async () => {
        stores.sections.set(original_sections)
        await dataChanged({ table: 'sections', action: 'delete', id: new_block.id })
      }
    })
    update_page_preview()
  },
  delete_block: async (block) => {
    const original_sections = _.cloneDeep(get(stores.sections))
    const new_sections = original_sections.filter(section => section.id !== block.id).map((section, i) => ({ ...section, index: i }))

    await update_timeline({
      doing: async () => {
        stores.sections.set(new_sections)
        await dataChanged({ table: 'sections', action: 'delete', id: block.id })
        await dataChanged({ table: 'sections', action: 'upsert', data: new_sections.map(s => ({ ...s, symbol: s.symbol })) })
      },
      undoing: async () => {
        stores.sections.set(original_sections)
        await dataChanged({ table: 'sections', action: 'insert', data: { ...block, symbol: block.symbol } })
        await dataChanged({ table: 'sections', action: 'upsert', data: original_sections.map(s => ({ ...s, symbol: s.symbol })) })
      }
    })
    update_page_preview()
  },
  update: async (obj) => {
    const current_page = _.cloneDeep(get(activePage.default))

    await update_timeline({
      doing: async () => {
        activePage.set(obj)
        await dataChanged({ table: 'pages', action: 'update', id: current_page.id, data: obj })
      },
      undoing: async () => {
        activePage.set(current_page)
        await dataChanged({ table: 'pages', action: 'update', id: current_page.id, data: current_page })
      }
    })
    update_page_preview()
  },
}

export const pages = {
  /** @param {{ details: { id: string, name: string, url: string, parent: string | null}, source: string | null }} new_page */
  create: async ({ details, source = null }) => {
    const original_pages = cloneDeep(get(stores.pages))

    const source_page = find(original_pages, { id: source }) || Page()
    const new_page = {
      ...source_page,
      ...details,
    }

    let new_sections = []
    if (source) {
      const res = await dataChanged({ table: 'sections', action: 'select', match: { page: source } })
      new_sections = res?.map(section => ({
        ...section,
        id: uuidv4(),
        page: new_page.id
      }))
    }
    await update_timeline({
      doing: async () => {
        stores.pages.update(store => [...store, new_page])
        await dataChanged({
          table: 'pages',
          action: 'insert',
          data: { 
            ...new_page,
            site: get(site)['id'],
            created_at: new Date().toISOString()
          }
        })
        await dataChanged({
          table: 'sections',
          action: 'insert',
          data: new_sections
        })
      },
      undoing: async () => {
        stores.pages.set(original_pages)
        await dataChanged({
          table: 'sections',
          action: 'delete',
          match: { page: new_page.id }
        })
        await dataChanged({ table: 'pages', action: 'delete', id: new_page.id })
      }
    })
  },
  delete: async (page_id) => {
    const original_pages = cloneDeep(get(stores.pages))
    const updated_pages = original_pages.filter(page => page.id !== page_id && page.parent !== page_id)
    let deleted_sections = []
    let deleted_pages = original_pages.filter(page => page.id === page_id || page.parent === page_id)

    await update_timeline({
      doing: async () => {
        stores.pages.set(updated_pages)

        // Delete child pages
        const child_pages = original_pages.filter(page => page.parent === page_id)
        if (child_pages.length > 0) {
          await Promise.all(
            child_pages.map(async page => {
              const sections_to_delete = await dataChanged({ table: 'sections', action: 'delete', match: { page: page.id } })
              deleted_sections = sections_to_delete ? [...deleted_sections, ...sections_to_delete] : deleted_sections
              await dataChanged({ table: 'pages', action: 'delete', id: page.id })
            })
          ) 
        }

        // Delete page
        const sections_to_delete = await dataChanged({ table: 'sections', action: 'delete', match: { page: page_id } })
        deleted_sections = sections_to_delete ? [...deleted_sections, ...sections_to_delete] : deleted_sections
        await dataChanged({ table: 'pages', action: 'delete', id: page_id })

        // Go to home page if active page is deleted
        if (get(activePageID) === page_id) {
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
    const original_page = cloneDeep(get(stores.pages).find(page => page.id === page_id))
    const current_pages = cloneDeep(get(stores.pages))
    const updated_pages = current_pages.map(page => page.id === page_id ? { ...page, ...obj } : page)
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

export async function update_page_preview(page = get(activePage.default)) {
  const preview = await buildStaticPage({ page, no_js: true })
  if (page.url === 'index') {
    await storageChanged({
      bucket: 'sites',
      action: 'upload',
      key: `${get(stores.site).id}/${page.id}/index.html`,
      file: preview,
      options: { upsert: true }
    })
    await storageChanged({
      bucket: 'sites',
      action: 'upload',
      key: `${get(stores.site).id}/preview.html`,
      file: preview,
      options: { upsert: true }
    })
  } else {
    await storageChanged({
      bucket: 'sites',
      action: 'upload',
      key: `${get(stores.site).id}/${page.id}/index.html`,
      file: preview,
      options: { upsert: true }
    })
  }
}

export async function update_symbol_with_static_values(component) {
  const { symbol } = component
  let updated_symbol = cloneDeep({
    ...symbol,
    ...component
  })
  for (let field of symbol.fields) {
    if (field.is_static) {
      const component_field_value = component.content[get(locale)][field.key]
      updated_symbol.content[get(locale)][field.key] = component_field_value
    }
  }
  symbols.update({
    id: symbol.id,
    content: updated_symbol.content
  })
}

// extract symbol/instance content from updated section content
export async function update_section_content(section, updated_content) {
  const symbol = get(stores.symbols).find(symbol => symbol.id === section.symbol)

  const original_symbol_content = _.cloneDeep(symbol.content)
  const original_section_content = _.cloneDeep(section.content)

  await update_timeline({
    doing: async () => {

			const updated_symbol_content = cloneDeep(symbol.content)
			const updated_instance_content = {}

			Object.entries(updated_content).forEach(([language_key, language_content]) => {
				Object.entries(language_content).forEach(([field_key, field_value]) => {
					const matching_field = symbol.fields.find((field) => field.key === field_key)
					if (matching_field.is_static) {
						updated_symbol_content[language_key] = {
							...updated_symbol_content[language_key],
							[field_key]: field_value
						}
					} else {
						updated_instance_content[language_key] = {
							...updated_instance_content[language_key],
							[field_key]: field_value
						}
					}
				})
			})

      stores.symbols.update(store => store.map(s => s.id === symbol.id ? { ...s, content: updated_symbol_content } : s))
      stores.sections.update(store => store.map(s => s.id === section.id ? { ...s, content: updated_instance_content } : s))
      await Promise.all([
        dataChanged({ table: 'sections', action: 'update', id: section.id, data: { content: updated_instance_content } }),
        dataChanged({ table: 'symbols', action: 'update', id: symbol.id, data: { content: updated_symbol_content } })
      ])
    },
    undoing: async () => {
      stores.symbols.update(store => store.map(s => s.id === symbol.id ? { ...s, content: original_symbol_content } : s))
      stores.sections.update(store => store.map(s => s.id === section.id ? { ...s, content: original_section_content } : s))
      await dataChanged({ table: 'sections', action: 'update', id: section.id, data: { content: original_section_content } })
    }
  })
  update_page_preview()
}

export async function add_language(key) {
  await update_timeline({
    doing: async () => {

      site_content.update(s => ({
        ...s,
        [key]: s['en']
      }))

      stores.pages.update((store) => store.map(page => ({
        ...page,
        content: {
          ...page.content,
          [key]: page.content['en']
        }
      })))

      stores.symbols.update((store) => store.map(symbol => ({
        ...symbol,
        content: {
          ...symbol.content,
          [key]: symbol.content['en']
        }
      })))

      stores.sections.update((store) => store.map(section => ({
        ...section,
        content: {
          ...section.content,
          [key]: section.content['en']
        }
      })))

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
        ...get(stores.symbols).map(async symbol => {
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
        ...get(stores.pages).map(async page => {
          await dataChanged({
            table: 'sections',
            action: 'select',
            match: { page: page.id },
            order: ['index', { ascending: true }],
          }).then(async all_sections => {
            all_sections.map(async section => {
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
        }),
      ])
    },
    undoing: async () => {

      locale.set('en')

      site_content.update(s => {
        delete s[key]
        return s
      })

      stores.pages.update((store) => store.map(page => {
        delete page.content[key]
        return page
      }))

      stores.sections.update((store) => store.map(section => {
        delete section.content[key]
        return section
      }))

      stores.symbols.update((store) => store.map(symbol => {
        delete symbol.content[key]
        return symbol
      }))

      await Promise.all([
        await dataChanged({
          table: 'sites',
          action: 'update',
          id: get(site)['id'],
          data: {
            content: get(site_content)
          }
        }),
        ...get(stores.sections).map(async section => {
          await dataChanged({
            table: 'sections',
            action: 'update',
            id: section.id,
            data: {
              content: section.content
            }
          })
        }),
        ...get(stores.pages).map(async page => {

          await dataChanged({
            table: 'sections',
            action: 'select',
            match: { page: page.id },
            order: ['index', { ascending: true }],
          }).then(async all_sections => {
            all_sections.map(async section => {
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
        }),
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
      site_content.update(s => {
        delete s[key]
        return s
      })
    
      stores.pages.update((store) => store.map(page => {
        delete page.content[key]
        return page
      }))
    
      stores.sections.update((store) => store.map(section => {
        delete section.content[key]
        return section
      }))
    
      stores.symbols.update((store) => store.map(symbol => {
        delete symbol.content[key]
        return symbol
      }))

      await Promise.all([
        await dataChanged({
          table: 'sites',
          action: 'update',
          id: get(site)['id'],
          data: {
            content: get(site_content)
          }
        }),
        ...get(stores.sections).map(async section => {
          await dataChanged({
            table: 'sections',
            action: 'update',
            id: section.id,
            data: {
              content: section.content
            }
          })
        }),
        ...get(stores.pages).map(async page => {
          await dataChanged({
            table: 'pages',
            action: 'update',
            id: page.id,
            data: {
              content: page.content
            }
          })
        }),
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
          data: get(stores.sections).map(section => ({ id: section.id, content: section.content }))
        }),
        await dataChanged({
          table: 'pages',
          action: 'upsert',
          data: get(stores.pages).map(page => ({ 
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

export async function updatePreview(updatedSite = get(site)) {
  if (import.meta.env.SSR) return
  const channel = new BroadcastChannel('site_preview')
  channel.postMessage({
    site: updatedSite,
    pageID: get(activePageID)
  })
}