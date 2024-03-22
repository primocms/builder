import { get } from 'svelte/store'
import { createUniqueID } from '$lib/utilities'
import pages from '$lib/stores/data/pages'
import symbols from '$lib/stores/data/symbols'
// import beautify from 'js-beautify' // remove for now to reduce bundle size, dynamically import later if wanted
import { dataChanged } from '$lib/database.js'
import { deploy } from '$lib/deploy'
import { buildStaticPage } from '$lib/stores/helpers'
import { processCode } from '$lib/utils'
import _ from 'lodash-es'
import { page } from '$app/stores'
import { site } from '$lib/stores/data/site'

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

export async function build_site_bundle({ pages, symbols }, include_assets = false) {
	let site_bundle

	const all_sections = []
	const all_pages = []
	const image_files = []

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
		const sections = await dataChanged({
			table: 'sections',
			action: 'select',
			match: { page: page.id },
			order: ['index', { ascending: true }]
		})

		// Download images & replace urls in sections
		if (include_assets && has_nested_property(sections, 'alt')) {
			await Promise.all(
				sections.map(async (section, i) => {
					const response = await swap_in_local_asset_urls(section.content)
					image_files.push(...response.image_files) // store image blobs for later download
					sections[i]['content'] = response.content // replace image urls in content with relative urls
				})
			)
		}

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
		let full_url = page.url
		if (page.url === 'index' || page.url === '404') {
			path = `${page.url}.html`
		} else if (parent) {
			path = `${parent_urls.join('/')}/${page.url}/index.html`
			full_url = `${parent_urls.join('/')}/${page.url}`
		} else {
			path = `${page.url}/index.html`
		}

		// add language prefix
		if (language !== 'en') {
			path = `${language}/${path}`
			full_url = `${language}/${full_url}`
		} else {
			// only add en sections and pages to primo.json
			all_sections.push(...sections)
			all_pages.push(page)
		}

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
			...image_files,
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

/**
 * @param {import('$lib').Content}
 */
async function swap_in_local_asset_urls(content) {
	const files_to_fetch = []
	
	const updated_content = _.mapValues(content, (lang_value) =>
		_.mapValues(lang_value, (field_value) => {

			function swap_image(field_value) {
				const urlObject = new URL(field_value.url)
				const pathname = urlObject.pathname
				const extension = pathname.slice(pathname.lastIndexOf('.'))
				const filename =
					field_value.alt.replace(/[\/:*?"<>|\s]/g, '_') + `---${createUniqueID()}` + extension

				files_to_fetch.push({
					url: field_value.url,
					filename
				})
				return {
					...field_value,
					url: `./images/${filename}`
				}
			}

			if (typeof field_value === 'object' && field_value.hasOwnProperty('alt') && field_value.url != "") {
				return swap_image(field_value);
			} else if (Array.isArray(field_value)) {
				
				let field_value_copy = [];
				_.each(field_value, (value) => {
					if (typeof value === 'object' && value.hasOwnProperty('image') && typeof value.image === 'object') {
						let img = value.image;
						if (img.url != "" && img.url.indexOf("data:image") == -1) {
							field_value_copy.push({
								...value,
								image: swap_image(img)
							});
						}
					} else {
						field_value_copy.push(value);
					}
				});
				return field_value_copy;
			} else {
				return field_value
			}


		})
	)

	// Download images
	const image_files = []
	await Promise.all(
		files_to_fetch.map(async ({ url, filename }) => {
			try {
				const response = await fetch(url);
				const blob = await response.blob();
	
				image_files.push({
					path: `./images/${filename}`,
					blob
				});
			} catch (e) {
				console.log(e.message);
			}
		})
	)

	return {
		content: updated_content,
		image_files
	}
}

function has_nested_property(obj, key) {
	if (obj.hasOwnProperty(key)) {
		return true
	}
	for (let i in obj) {
		if (typeof obj[i] === 'object') {
			if (has_nested_property(obj[i], key)) {
				return true
			}
		}
	}
	return false
}
