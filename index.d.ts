export type Section = {
	id: string
	content: Content
	index: number
	symbol: Symbol
	page: string
	page_type: string
	created_at?: string
	master?: string
}

export type Symbol = {
	id: string
	name: string
	code: Code
	fields: Array<Field>
	content: Content
	site: string
	index: number
}

type Content_Value =
	| string
	| Image_Content
	| Markdown_Content
	| Repeater_Content
	| Group_Content
	| Switch_Content
	| Link_Content
type Image_Content = {
	url: string
	alt: string
}
type Markdown_Content = {
	html: string
	markdown: string
}
type Switch_Content = boolean
type Repeater_Content = Array<Group_Content>
type Group_Content = {
	[subfield_key: string]: Content_Value
}
type Link_Content = {
	url: string
	label: string
}

export type Content = {
	en: {
		[field_key: string]: Content_Value //
	}
	[locale: string]: {
		[field_key: string]: Content_Value //
	}
}

export type Field = {
	id: string
	key: string
	label: string
	type:
	| 'repeater'
	| 'group'
	| 'text'
	| 'markdown'
	| 'image'
	| 'number'
	| 'switch'
	| 'url'
	| 'link'
	| 'select'
	| 'icon'
	| 'info'
	fields: Array<Field>
	options: object
	is_static: boolean
	index?: number
	value?: string // only used internally
}

export type Code = {
	html: string
	css: string
	js: string
}

export type Block_Code = {
	html: string
	css: string
	js: string
}

export type Page_Code = {
	html: {
		head: string
		below: string
	}
	css: string
	js: string
}

export type Page = {
	id: string
	name: string
	url: string
	code: Page_Code
	fields: Array<Field>
	content: Content
	site: string
	parent: string | null
	created_at?: string
	page_type: Page_Type
}

export type Page_Type = {
	id: string
	name: string
	code: Page_Code
	fields: Array<Field>
	content: Content
	site: string
	created_at?: string
	color: string
	icon: string
}

export type Site = {
	id: string
	name: string
	url: string
	code: Page_Code
	fields: Array<Field>
	content: Content
	created_at?: string
	design: {
		heading_font: string
		body_font: string
		brand_color: string
		accent_color: string
		roundness: string
		depth: string
	}
	custom_domain: string
	custom_domain_validated: boolean
	distribution_domain_name: string
	validation_record: {
		type: string
		name: string
		value: string
	}
}

export type User = {
	id: string
	email: string
	role: 'DEV' | 'EDITOR'
	collaborator: boolean
	github_token?: string
	created_at: string
	pro: boolean
}

export type Site_Data = {
	site: Site
	pages: Array<Page>
	page_types: Array<Page_Type>
	sections: Array<Section>
	symbols: Array<Symbol>
	fields: Array<Field>
	content: Array<Content>
}
