import {get} from 'svelte/store'
import pages from '$lib/stores/data/pages'
// import beautify from 'js-beautify' // remove for now to reduce bundle size, dynamically import later if wanted
import { dataChanged } from '$lib/database.js'
import {deploy} from '$lib/deploy'
import { buildStaticPage } from '$lib/stores/helpers'
import _ from 'lodash-es'
import {page} from '$app/stores'
import {site} from '$lib/stores/data/site'

export async function push_site(repo) {
  const files = (
    await buildSiteBundle({
      pages: get(pages),
    })
  ).map((file) => {
    return {
      file: file.path,
      data: file.content,
    }
  })

  return await deploy({ files, site_id: get(site).id, repo })
}

export async function buildSiteBundle({ pages }) {
  let all_sections = []
  let all_pages = []

  const page_files = await Promise.all(pages.map((page) => {

    return Promise.all(Object.keys(page.content).map((language) => {
      return buildPageTree(page, language)
    }))

  }))

  return buildSiteTree(page_files.flat())

  async function buildPageTree(page, language) {
    const { url } = page
    const sections = await dataChanged({
      table: 'sections',
      action: 'select',
      match: { page: page.id },
      order: ['index', { ascending: true }],
    })

    const { html, js } = await buildStaticPage({
      page,
      page_sections: sections,
      separateModules: true,
      locale: language
    })
    // const formattedHTML = await beautify.html(html)

    let parent_urls = []
    const parent = pages.find(p => p.id === page.parent)

    if (parent) {
      let no_more_parents = false
      let grandparent = parent
      parent_urls.push(parent.url)
      while (!no_more_parents){
        grandparent = pages.find(p => p.id === grandparent.parent)
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
    } else if (parent){
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

    all_sections = [ ...all_sections, ...sections ]
    all_pages = [ ...all_pages, page ]

    const page_tree = [
      {
        path,
        content: html,
      },
    ]

    if (js && language !== 'en') {
      page_tree.push({
        path: url === 'index' ? `${language}/_module.js` : `${full_url}/_module.js`,
        content: js,
      })
    } else if (js) {
      page_tree.push({
        path: url === 'index' ? '_module.js' : `${full_url}/_module.js`,
        content: js,
      })
    }

    return page_tree
  }

  async function buildSiteTree(pages) {
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
      pages: all_pages.map(p => ({
        id: p.id,
        url: p.url,
        name: p.name,
        code: p.code,
        fields: p.fields,
        content: p.content,
        site: p.site,
        parent: p.parent
      })),
      sections: all_sections.map(s => ({
        id: s.id,
        content: s.content,
        page: s.page,
        site: s.site,
        symbol: s.symbol,
        index: s.index
      })),
      symbols: symbols.map(s => ({
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
        content: json,
      },
      {
        path: 'edit/index.html',
        content: `<!DOCTYPE html>
        <html lang="en">
          <head>
            <meta http-equiv="Refresh" content="0; url='${get(page).url.origin}/${get(page).params.site}'" />
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
        content: `User-agent: *`,
      },
    ]
  }
}