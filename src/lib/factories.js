import { v4 as uuidv4 } from 'uuid'
import { createUniqueID } from './utilities.js'

/**
 * Creates a new field object with default values.
 * @param field - The field properties to be applied to the new field
 * @returns {import('$lib').Field}
 */
export const Field = (field = {}) => ({
	id: createUniqueID(),
	key: '',
	label: '',
	type: 'text',
	fields: [],
	options: {},
	is_static: false,
	value: '',
	...field
})

/**
 * @param section
 * @returns {import('$lib').Section}
 */
export const Section = (section) => ({
	id: uuidv4(),
	content: section.content || {
		en: {}
	},
	index: section.index || 0,
	symbol: section.symbol,
	page: section.page,
	page_type: section.page_type,
	created_at: section.created_at || new Date().toISOString(),
	instance_of: section.instance_of || null
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
	fields: symbol.fields || [],
	content: symbol.content || {
		en: {}
	},
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
	url: '',
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
	page_type: null,
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
	metadata: {
		title: '',
		description: '',
		image: ''
	},
	color: '#2B407D',
	icon: 'mdi:rocket',
	...page
})

/**
 * Creates a new site object with default values.
 * @param site - The site properties to be applied to the new site
 * @returns {import('$lib').Site}
 */
export const Site = (site = {}) => ({
	id: uuidv4(),
	url: '',
	name: '',
	code: {
		html: {
			head: ``,
			below: ''
		},
		css: ``,
		js: ''
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
	metadata: {
		favicon: '',
		title: site.name || '',
		description: '',
		image: ''
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

export const languages = [
	{
		key: 'af',
		name: 'Afrikaans'
	},
	{
		key: 'ar',
		name: 'Arabic'
	},
	{
		key: 'be',
		name: 'Belarusian'
	},
	{
		key: 'bg',
		name: 'Bulgarian'
	},
	{
		key: 'bs',
		name: 'Bosnian'
	},
	{
		key: 'ca',
		name: 'Catalan'
	},
	{
		key: 'cs',
		name: 'Czech'
	},
	{
		key: 'cy',
		name: 'Welsh'
	},
	{
		key: 'da',
		name: 'Danish'
	},
	{
		key: 'de',
		name: 'German'
	},
	{
		key: 'el',
		name: 'Greek'
	},
	{
		key: 'en',
		name: 'English'
	},
	{
		key: 'fa',
		name: 'Persian'
	},
	{
		key: 'fi',
		name: 'Finnish'
	},
	{
		key: 'fr',
		name: 'French'
	},
	{
		key: 'he',
		name: 'Hebrew'
	},
	{
		key: 'hi',
		name: 'Hindi'
	},
	{
		key: 'hu',
		name: 'Hungarian'
	},
	{
		key: 'hy-am',
		name: 'Armenian'
	},
	{
		key: 'id',
		name: 'Indonesian'
	},
	{
		key: 'is',
		name: 'Icelandic'
	},
	{
		key: 'it',
		name: 'Italian'
	},
	{
		key: 'ja',
		name: 'Japanese'
	},
	{
		key: 'ka',
		name: 'Georgian'
	},
	{
		key: 'kk',
		name: 'Kazakh'
	},
	{
		key: 'km',
		name: 'Cambodian'
	},
	{
		key: 'ko',
		name: 'Korean'
	},
	{
		key: 'lo',
		name: 'Lao'
	},
	{
		key: 'lt',
		name: 'Lithuanian'
	},
	{
		key: 'lv',
		name: 'Latvian'
	},
	{
		key: 'mk',
		name: 'Macedonian'
	},
	{
		key: 'mn',
		name: 'Mongolian'
	},
	{
		key: 'ms',
		name: 'Malay'
	},
	{
		key: 'my',
		name: 'Burmese'
	},
	{
		key: 'ne',
		name: 'Nepalese'
	},
	{
		key: 'nl',
		name: 'Dutch'
	},
	{
		key: 'pl',
		name: 'Polish'
	},
	{
		key: 'pt',
		name: 'Portuguese'
	},
	{
		key: 'ro',
		name: 'Romanian'
	},
	{
		key: 'ru',
		name: 'Russian'
	},
	{
		key: 'sk',
		name: 'Slovak'
	},
	{
		key: 'sl',
		name: 'Slovenian'
	},
	{
		key: 'sq',
		name: 'Albanian'
	},
	{
		key: 'sv',
		name: 'Swedish'
	},
	{
		key: 'th',
		name: 'Thai'
	},
	{
		key: 'tl-ph',
		name: 'Tagalog (Philippines)'
	},
	{
		key: 'tr',
		name: 'Turkish'
	},
	{
		key: 'uk',
		name: 'Ukrainian'
	},
	{
		key: 'ur',
		name: 'Urdu'
	},
	{
		key: 'uz',
		name: 'Uzbek'
	},
	{
		key: 'vi',
		name: 'Vietnamese'
	},
	{
		key: 'zh',
		name: 'Chinese'
	},
	{
		key: 'es',
		name: 'Spanish'
	},
	{
		key: 'et',
		name: 'Estonian'
	}
]
