import { v4 as uuidv4 } from 'uuid'
import { createUniqueID } from './utilities.js'

export const Content_Row = (row = {}) => ({
	id: uuidv4(),
	value: row.value !== undefined ? row.value : null,
	locale: row.locale || null,
	field: row.field || null,
	index: row.index || null,
	parent: row.parent || null,
	metadata: row.metadata || null
})

export const Field_Row = (field = {}) => ({
	// id: field.id || createUniqueID(), // necessary to maintain id? removing to address corrupt data where IDs the same
	id: uuidv4(),
	key: field.key || '',
	label: field.label || '',
	type: field.type || 'text',
	options: field.options || {},
	is_static: field.is_static || false,
	index: field.index || 0,
	parent: field.parent || null
})

/**
 * Creates a new field object with default values.
 * @param field - The field properties to be applied to the new field
 * @returns {import('$lib').Field}
 */
export const Field = (field = {}) => ({
	// id: field.id || createUniqueID(), // necessary to maintain id? removing to address corrupt data where IDs the same
	id: uuidv4(),
	key: field.key || '',
	label: field.label || '',
	type: field.type || 'text',
	fields: field.fields || [],
	options: field.options || {},
	is_static: field.is_static || false,
	index: field.index || 0,
	links: field.links || []
})

/**
 * @param section
 * @returns {import('$lib').Section}
 */
export const Section = (section) => ({
	id: uuidv4(),
	// content: section.content || {
	// 	en: {}
	// },
	index: section.index || 0,
	symbol: section.symbol,
	page: section.page,
	page_type: section.page_type,
	created_at: section.created_at || new Date().toISOString(),
	master: section.master || null
})

/**
 * Creates a new symbol object with default values.
 * @param symbol - The symbol properties to be applied to the new symbol
 * @returns {import('$lib').Symbol}
 */
export const Symbol = (symbol) => ({
	id: symbol.id || uuidv4(),
	name: symbol.name || 'New Block',
	code: symbol.code || {
		css: '',
		html: '',
		js: ''
	},
	// fields: symbol.fields || [],
	// content: symbol.content || {
	// 	en: {}
	// },
	site: symbol.site || null,
	index: symbol.index || 0
})

/**
 * Creates a new page object with default values.
 * @param page - The page properties to be applied to the new page
 * @returns {import('$lib').Page}
 */
export const Page = (page = {}) => ({
	id: uuidv4(),
	slug: '',
	name: '',
	code: {
		html: {
			head: '',
			below: ''
		},
		css: '',
		js: ''
	},
	fields: [],
	content: {
		en: {}
	},
	parent: null,
	site: '',
	created_at: new Date().toISOString(),
	metadata: {
		title: '',
		description: '',
		image: ''
	},
	page_type: Page_Type(),
	...page
})

/**
 * Creates a new page object with default values.
 * @param page - The page properties to be applied to the new page
 * @returns {import('$lib').Page_Type}
 */
export const Page_Type = (page = {}) => ({
	id: uuidv4(),
	name: '',
	code: {
		html: {
			head: '',
			below: ''
		},
		css: '',
		js: ''
	},
	fields: [],
	content: {
		en: {}
	},
	site: '',
	created_at: new Date().toISOString(),
	color: 'transparent',
	icon: '',
	...page
})

/**
 * Creates a new site object with default values.
 * @param site - The site properties to be applied to the new site
 * @returns {import('$lib').Site}
 */
export const Site = (site = {}) => ({
	id: uuidv4(),
	slug: '',
	name: '',
	code: {
		head: '',
		foot: ''
	},
	fields: [],
	content: {
		en: {
			// locale
		}
	},
	design: {
		heading_font: 'open-sans',
		body_font: 'open-sans',
		brand_color: 'red',
		accent_color: 'blue',
		roundness: '8px',
		depth: '0px 4px 30px rgba(0, 0, 0, 0.2)'
	},
	custom_domain: '',
	created_at: new Date().toISOString(),
	...site
})

export const design_tokens = {
	heading_font: {
		label: 'Heading Font',
		type: 'font-family',
		variable: 'font-heading',
		group: ''
	},
	body_font: {
		label: 'Body Font',
		type: 'font-family',
		variable: 'font-body',
		group: ''
	},
	brand_color: {
		label: 'Brand Color',
		type: 'color',
		variable: 'color-brand',
		group: ''
	},
	accent_color: {
		label: 'Accent Color',
		type: 'color',
		variable: 'color-accent',
		group: ''
	},
	roundness: {
		label: 'Roundness (Border Radius)',
		type: 'border-radius',
		variable: 'border-radius',
		group: ''
	},
	depth: {
		label: 'Depth (Shadows)',
		type: 'box-shadow',
		variable: 'box-shadow',
		group: ''
	}
}

export const Site_Tokens_CSS = (values) => {
	return `
		<link rel="preconnect" href="https://fonts.googleapis.com">
		<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
		<link href="https://fonts.googleapis.com/css2?family=${values['heading_font'].replace(
			/ /g,
			'+'
		)}:ital,wght@0,300;0,400;0,700;1,300;1,400;1,700&family=${values['body_font'].replace(
		/ /g,
		'+'
	)}:ital,wght@0,300;0,400;0,700;1,300;1,400;1,700" rel="stylesheet">
	<style>
	:root {\n${Object.entries(design_tokens)
		.map(([token, { variable }]) => `--${variable}: ${values[token]};`)
		.join('\n')}}
	</style>
	`
}
