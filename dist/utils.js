import _, { chain as _chain, capitalize as _capitalize } from "lodash-es";
import { processors } from './component'

const componentsCache = new Map();
export async function processCode({ component, buildStatic = true, format = 'esm', locale = 'en', hydrated = true, ignoreCachedData = false }) {
  let css = ''
  if (component.css) {
    css = await processCSS(component.css || '')
  }

  const cacheKey = ignoreCachedData ? JSON.stringify({
    component: Array.isArray(component) ? component.map(c => ({ html: c.html, css: c.css, head: c.head })) : {
      head: component.head,
      html: component.html,
      css: component.css
    },
  }) : JSON.stringify({
    component,
    format,
    buildStatic,
    hydrated
  })

  if (componentsCache.has(cacheKey)) {
    return componentsCache.get(cacheKey)
  }

  const res = await processors.html({
    component: {
      ...component,
      css
    }, buildStatic, format, locale, hydrated
  })

  componentsCache.set(cacheKey, res)

  return res
}

const cssCache = new Map();
export async function processCSS(raw) {
  if (cssCache.has(raw)) {
    return cssCache.get(raw)
  }

  const res = await processors.css(raw) || {}
  if (!res) {
    return ''
  } else if (res.error) {
    console.log('CSS Error:', res.error)
    return raw
  } else if (res.css) {
    cssCache.set(raw, res.css)
    return res.css
  }
}

// Lets us debounce from reactive statements
export function createDebouncer(time) {
  return _.debounce((val) => {
    const [fn, arg] = val;
    fn(arg);
  }, time);
}

export function wrapInStyleTags(css, id) {
  return `<style type="text/css" ${id ? `id = "${id}"` : ""}>${css}</style>`;
}

export function getEmptyValue(field) {
  if (field.default) return field.default
  if (field.type === 'repeater') return []
  else if (field.type === 'group') return getGroupValue(field)
  else if (field.type === 'image') return {
    url: '',
    src: '',
    alt: '',
    size: null
  }
  else if (field.type === 'text') return ''
  else if (field.type === 'markdown') return { html: '', markdown: '' }
  else if (field.type === 'link') return {
    label: '',
    url: ''
  }
  else if (field.type === 'url') return ''
  else if (field.type === 'select') return ''
  else if (field.type === 'switch') return true
  else {
    console.warn('No placeholder set for field type', field.type)
    return ''
  }

  function getGroupValue(field) {
    return _chain(field.fields).keyBy('key').mapValues((field) => getEmptyValue(field)).value()
  }
}

let converter, showdown, showdown_highlight
export async function convert_html_to_markdown(html) {
  if (converter) {
    return converter.makeMarkdown(html)
  } else {
    const modules = await Promise.all([import('showdown'), import('showdown-highlight')])
    showdown = modules[0].default
    showdown_highlight = modules[1].default
    converter = new showdown.Converter({
      extensions: [showdown_highlight()]
    })
    return converter.makeMarkdown(html)
  }
}

export async function convert_markdown_to_html(markdown) {
  if (converter) {
    return converter.makeHtml(markdown)
  } else {
    const modules = await Promise.all([import('showdown'), import('showdown-highlight')])
    showdown = modules[0].default
    showdown_highlight = modules[1].default
    converter = new showdown.Converter({
      extensions: [showdown_highlight()]
    })
    return converter.makeHtml(markdown)
  }
}