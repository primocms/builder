import Number from './Number.svelte'
import Image from './Image.svelte'
import Markdown from './Markdown.svelte'
import Switch from './Switch.svelte'
import URL from './URL.svelte'
import Link from './Link.svelte'
import Information from './Information.svelte'
import Select from './Select.svelte'
import RepeaterField from './RepeaterField.svelte'
import GroupField from './GroupField.svelte'
import ContentField from './ContentField.svelte'
// import ColorPicker from './ColorPicker.svelte'
import IconPicker from './IconPicker.svelte'

export default [
	{
		id: 'repeater',
		label: 'Repeater',
		component: RepeaterField
	},
	{
		id: 'group',
		label: 'Group',
		component: GroupField
	},
	{
		id: 'text',
		label: 'Text',
		component: ContentField
	},
	{
		id: 'markdown',
		label: 'Markdown',
		component: Markdown
	},
	{
		id: 'image',
		label: 'Image',
		component: Image
	},
	{
		id: 'number',
		label: 'Number',
		component: Number
	},
	{
		id: 'switch',
		label: 'Switch',
		component: Switch
	},
	{
		id: 'url',
		label: 'URL',
		component: URL
	},
	{
		id: 'link',
		label: 'Link',
		component: Link
	},
	{
		id: 'select',
		label: 'Select',
		component: Select
	},
	{
		id: 'icon',
		label: 'Icon',
		component: IconPicker
	},
	{
		id: 'info',
		label: 'Info',
		component: Information
	}
	// {
	//   id: 'color',
	//   label: 'Color Picker',
	//   component: ColorPicker
	// }
]
