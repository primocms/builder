import { find as _find, chain as _chain, flattenDeep as _flattenDeep } from 'lodash-es'
import _ from 'lodash-es'
import { get } from 'svelte/store'
import { processors } from '../component.js'
import { site as activeSite } from './data/site.js'
import sections from './data/sections.js'
import symbols from './data/symbols.js'
import { page } from '$app/stores'
import active_page from './app/active_page.js'
import { locale } from './app/misc.js'
import { processCSS, getEmptyValue } from '../utils.js'
import { site_design_css } from '../code_generators.js'
import { transform_content, transform_fields } from '../transform_data.js'

export async function get_symbol_usage_info(symbol_id) {
	const { data, error } = await get(page)
		.data.supabase.from('sections')
		.select('page(*)')
		.eq('symbol', symbol_id)
	if (data.length === 0) {
		return 'Not used on any pages'
	} else {
		const info = data.reduce(
			(previous, current) => {
				if (previous.pages.includes(current.page.name)) {
					return previous
				} else {
					return {
						n_pages: previous.n_pages + 1,
						pages: [...previous.pages, current.page.name]
					}
				}
			},
			{ n_pages: 0, pages: [] }
		)
		if (info.n_page === 1) {
			return `Used on ${info.pages[0]}`
		} else {
			return `Used on ${info.n_pages} page${info.n_pages === 1 ? '' : 's'}: ${info.pages.join(
				', '
			)}`
		}
	}

	// return info
}

export function getSymbol(symbolID) {
	return _find(get(symbols), ['id', symbolID])
}

/**
 * @param {{
 *  page?: import('$lib').Page
 *  site?: import('$lib').Site
 *  page_sections?: import('$lib').Section[]
 *  page_symbols?: import('$lib').Symbol[]
 *  locale?: string
 *  no_js?: boolean
 * }} details
 * @returns {Promise<{ html: string, js: string}>}
 * */
export async function buildStaticPage({
	page = get(active_page),
	site = get(activeSite),
	page_sections = get(sections),
	page_symbols = get(symbols),
	locale = 'en',
	no_js = false
}) {
	const hydratable_symbols_on_page = page_symbols.filter(
		(s) => s.code.js && page_sections.some((section) => section.symbol === s.id)
	)

	const component = await Promise.all([
		(async () => {
			const css = await processCSS(site.code.css + page.code.css)
			const data = getPageData({ page, site, loc: locale })
			const metadata = {
				site_title: site.metadata.title,
				page_title:
					(page.page_type ? page.page_type.metadata.title : page.metadata.title) ||
					site.metadata?.title,
				page_description: page.page_type
					? page.page_type.metadata.description
					: page.metadata.description || site.metadata.title,
				page_image: page.page_type ? page.page_type.metadata.image : page.metadata.description
			}
			return {
				html: `
          <svelte:head>
            ${site.code.html.head}
            ${page.code.html.head}

						<title>${metadata.page_title}</title>\n
						<meta name="description" content="${metadata.page_description}">

						${
							site.metadata.favicon
								? `<link rel="icon" href="${site.metadata.favicon}" type="image/x-icon">\
									 <link rel="shortcut icon" href="${site.metadata.favicon}" type="image/x-icon">`
								: ``
						}
						<!-- Facebook Meta Tags -->
						<meta property="og:url" content="https://${site.custom_domain || site.id + '.breezly.site'}/${
					page.url === 'index' ? '' : page.url
				}">
						<meta property="og:type" content="website">
						<meta property="og:title" content="${metadata.page_title}">
						<meta property="og:description" content="${metadata.page_description}">
						${page.metadata?.image ? `<meta property="og:image" content="${page.metadata?.image}">` : ``}

						<!-- Twitter Meta Tags -->
						<meta name="twitter:card" content="summary_large_image">
						<meta property="twitter:domain" content="${site.custom_domain || site.id + '.breezly.site'}">
						<meta property="twitter:url" content="https://${site.custom_domain || site.id + '.breezly.site'}/${
					page.url === 'index' ? '' : page.url
				}">
						<meta name="twitter:title" content="${metadata.page_title}">
						<meta name="twitter:description" content="${metadata.page_description}">
						${metadata.page_image ? `<meta name="twitter:image" content="${metadata.page_image}">` : ``}
            <style>${css}</style>
						${site_design_css(site.design)}
          </svelte:head>`,
				css: ``,
				js: ``,
				data
			}
		})(),
		...page_sections
			.map(async (section) => {
				const symbol = page_symbols.find((symbol) => symbol.id === section.symbol)
				const { html, css: postcss, js } = symbol.code
				if (!symbol) {
					console.error('No symbol')
				}
				const data = get_content_with_static({
					component: section,
					symbol
				})[locale]
				const { css, error } = await processors.css(postcss || '')
				const section_id = section.id.split('-')[0]
				return {
					html: `
          <div class="section" id="section-${section_id}" data-symbol="${symbol.id}">
            ${html}
          </div>`,
					js,
					css,
					data
				}
			})
			.filter(Boolean), // remove options blocks
		(async () => {
			const data = getPageData({ page, site, loc: locale })
			return {
				html: site.code.html.below + page.code.html.below,
				css: ``,
				js: ``,
				data
			}
		})()
	])

	const res = await processors.html({
		component,
		locale
	})

	const final = `\
  <!DOCTYPE html>
  <html lang="${locale}">
    <head>
      <meta name="generator" content="Primo" />
      ${res.head}
      <style>${res.css}</style>
    </head>
    <body id="page">
      ${res.html}
      ${no_js ? `` : `<script type="module">${fetch_modules(hydratable_symbols_on_page)}</script>`}
    </body>
  </html>
  `

	return {
		html: final,
		js: res.js
	}

	// fetch module to hydrate component, include hydration data
	function fetch_modules(symbols) {
		return symbols
			.map(
				(symbol) => `
      import('/_symbols/${symbol.id}.js')
      .then(({default:App}) => {
        ${page_sections
					.filter((section) => section.symbol === symbol.id)
					.map((section) => {
						const section_id = section.id.split('-')[0]
						const instance_content = get_content_with_static({ component: section, symbol })[locale]
						return `
            new App({
              target: document.querySelector('#section-${section_id}'),
              hydrate: true,
              props: ${JSON.stringify(instance_content)}
            })
          `
					})
					.join('\n')}
      })
      .catch(e => console.error(e))
    `
			)
			.join('\n')
	}
}

// Include static content alongside the component's content
export function get_content_with_static({ component, symbol, existing_content }) {
	if (!symbol) return { en: {} }

	const loc = 'en'

	// temp workaround for error that happens when saving a symbol's fields & updating its local field IDs before section has updated
	let content = _.cloneDeep(existing_content)
	try {
		const symbol_fields = transform_fields(symbol)
		const symbol_content = transform_content(symbol)
		const component_content = transform_content({ ...component, fields: symbol.fields })
		if (!component_content) throw Error()
		content = _chain(symbol_fields)
			.map((field) => {
				const field_value = component_content?.[loc]?.[field.key]
				// if field is static, use value from symbol content
				if (field.is_static) {
					const symbol_value = symbol_content?.[loc]?.[field.key]
					return {
						key: field.key,
						value: symbol_value
					}
				} else if (field_value !== undefined) {
					return {
						key: field.key,
						value: field_value
					}
				} else {
					const default_content = symbol_content?.[loc]?.[field.key]
					return {
						key: field.key,
						value: default_content || getEmptyValue(field)
					}
				}
			})
			.keyBy('key')
			.mapValues('value')
			.value()
	} catch (e) {
		console.log('could not load new component content')
	}

	// TODO: handle other locales
	return _.cloneDeep({
		en: content
	})
}

export function getPageData({
	page = get(active_page),
	site = get(activeSite),
	loc = get(locale)
}) {
	const page_content = page.content[loc]
	const site_content = site.content[loc]
	return {
		...site_content,
		...page_content
	}
}
