import { get } from 'svelte/store'
import pages from '../../stores/data/pages'
import symbols from '../../stores/data/symbols'
// import beautify from 'js-beautify' // remove for now to reduce bundle size, dynamically import later if wanted
import { dataChanged } from '../../database.js'
import { deploy } from '../../deploy'
import { buildStaticPage } from '../../stores/helpers'
import { processCode } from '../../utils'
import _ from 'lodash-es'
import { page } from '$app/stores'
import { site } from '../../stores/data/site'

export async function push_site(repo_name, create_new = false) {
	const site_bundle = await build_site_bundle({
		pages: get(pages),
		symbols: get(symbols)
	})
	if (!site_bundle) {
		return null
	}

	const files = site_bundle.map((file) => ({
		file: file.path,
		data: file.content,
		size: new Blob([file.content], { type: 'text/plain' }).size / 1024
	}))

	return await deploy({ files, site_id: get(site).id, repo_name }, create_new)
}

export async function build_site_bundle({ pages, symbols }) {
	let site_bundle

	let all_sections = []
	let all_pages = []
	try {
		const page_files = await Promise.all(
			pages.map((page) => {
				return Promise.all(
					Object.keys(page.content).map((language) => {
						return build_page_tree(page, language)
					})
				)
			})
		)
		const symbol_files = await Promise.all(
			symbols.filter((s) => s.code.js).map((symbol) => build_symbol_tree(symbol))
		)
		site_bundle = build_site_tree([...symbol_files, ...page_files.flat()])
	} catch (e) {
		alert(e.message)
	}

	return site_bundle

	async function build_symbol_tree(symbol) {
		const res = await processCode({
			component: {
				html: symbol.code.html,
				css: symbol.code.css,
				js: symbol.code.js,
				data: symbol.content['en']
			}
		})
		if (res.error) {
			throw Error('Error processing symbol ' + symbol.name)
		}
		const date = new Intl.DateTimeFormat('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		}).format(new Date())
		return {
			path: '_symbols/' + symbol.id + '.js',
			content: `// ${symbol.name} - Updated ${date}\n` + res.js
		}
	}

	async function build_page_tree(page, language) {
		const { url } = page
		const sections = await dataChanged({
			table: 'sections',
			action: 'select',
			match: { page: page.id },
			order: ['index', { ascending: true }]
		})

		const { html } = await buildStaticPage({
			page,
			page_sections: sections,
			page_symbols: symbols.filter((symbol) =>
				sections.find((section) => section.symbol === symbol.id)
			),
			locale: language
		})
		// const formattedHTML = await beautify.html(html)

		let parent_urls = []
		const parent = pages.find((p) => p.id === page.parent)

		if (parent) {
			let no_more_parents = false
			let grandparent = parent
			parent_urls.push(parent.url)
			while (!no_more_parents) {
				grandparent = pages.find((p) => p.id === grandparent.parent)
				if (!grandparent) {
					no_more_parents = true
				} else {
					parent_urls.unshift(grandparent.url)
				}
			}
		}

		let path
		let full_url = url
		if (url === 'index' || url === '404') {
			path = `${url}.html`
		} else if (parent) {
			path = `${parent_urls.join('/')}/${url}/index.html`
			full_url = `${parent_urls.join('/')}/${url}`
		} else {
			path = `${url}/index.html`
		}

		// add language prefix
		if (language !== 'en') {
			path = `${language}/${path}`
			full_url = `${language}/${full_url}`
		}

		all_sections = [...all_sections, ...sections]
		all_pages = [...all_pages, page]

		const page_tree = [
			{
				path,
				content: html
			}
		]

		return page_tree
	}

	async function build_site_tree(pages) {
		const site = get(page).data.site
		const symbols = get(page).data.symbols
		const json = JSON.stringify({
			site: {
				id: site.id,
				name: site.name,
				url: site.url,
				code: site.code,
				fields: site.fields,
				content: site.content
			},
			pages: all_pages.map((p) => ({
				id: p.id,
				url: p.url,
				name: p.name,
				code: p.code,
				fields: p.fields,
				content: p.content,
				site: p.site,
				parent: p.parent
			})),
			sections: all_sections.map((s) => ({
				id: s.id,
				content: s.content,
				page: s.page,
				site: s.site,
				symbol: s.symbol,
				index: s.index
			})),
			symbols: symbols.map((s) => ({
				id: s.id,
				name: s.name,
				code: s.code,
				fields: s.fields,
				content: s.content,
				site: s.site
			})),
			version: 2
		})

		return [
			..._.flattenDeep(pages),
			{
				path: `primo.json`,
				content: json
			},
			{
				path: 'edit/index.html',
				content: `<!DOCTYPE html>
        <html lang="en">
          <head>
            <meta http-equiv="Refresh" content="0; url='${get(page).url.origin}/${
					get(page).params.site
				}'" />
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Edit site</title>
          </head>
          <body style="margin:0">
            <h1 style="font-family:sans-serif;text-align:center;">redirecting to Primo server</h1>
          </body>
        </html>
        `
			},
			{
				path: 'robots.txt',
				content: `User-agent: *`
			}
		]
	}
}
