import { find as _find, chain as _chain, flattenDeep as _flattenDeep } from 'lodash-es'
import _ from 'lodash-es'
import { get } from 'svelte/store'
import { processors } from '../component.js'
import { site as activeSite } from './data/site.js'
import sections from './data/sections.js'
import symbols from './data/symbols.js'
import pages from './data/pages.js'
import activePage from './app/activePage.js'
import { locale } from './app/misc.js'
import { processCSS, getEmptyValue } from '../utils.js'

export function getSymbolUseInfo(symbolID) {
	const info = { pages: [], frequency: 0 }
	get(pages).forEach((page) => {
		// TODO: fix this
		// page.sections.forEach(section => {
		//   if (section.symbolID === symbolID) {
		//     info.frequency++
		//     if (!info.pages.includes(page.id)) info.pages.push(page.name)
		//   }
		// })
	})
	return info
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
	page = get(activePage),
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
			return {
				html: `
          <svelte:head>
            ${site.code.html.head}
            ${page.code.html.head}
            <style>${css}</style>
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
				const data = get_content_with_static({
					component: section,
					symbol,
					loc: locale
				})
				const { css, error } = await processors.css(postcss || '')
				const section_id = section.id.split('-')[0]
				return {
					html: `
          <div class="section" id="section-${section_id}">
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
						const instance_content = get_content_with_static({
							component: section,
							symbol,
							loc: locale
						})
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
/**
 * @param {{
 *  component?: import('$lib').Section
 *  symbol?: import('$lib').Symbol
 *  loc?: string
 * }} details
 * @returns {import('$lib').Content}
 * */
export function get_content_with_static({ component, symbol, loc }) {
	if (!symbol) return { en: {} }
	const content = _chain(symbol.fields)
		.map((field) => {
			const field_value = component.content?.[loc]?.[field.key]
			// if field is static, use value from symbol content
			if (field.is_static) {
				const symbol_value = symbol.content?.[loc]?.[field.key]
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
				const default_content = symbol.content?.[loc]?.[field.key]
				return {
					key: field.key,
					value: default_content || getEmptyValue(field)
				}
			}
		})
		.keyBy('key')
		.mapValues('value')
		.value()

	return _.cloneDeep(content)
}

export function getPageData({ page = get(activePage), site = get(activeSite), loc = get(locale) }) {
	const page_content = page.content[loc]
	const site_content = site.content[loc]
	return {
		...site_content,
		...page_content
	}
}
