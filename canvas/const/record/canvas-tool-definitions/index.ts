/** Tools of SharedCanvas; `title` is the English fallback, the component shows catalog names by id. */
export const SHARED_CANVAS_TOOL_DEFINITIONS = [
	{
		id: 'select',
		icon: 'mouse-pointer',
		title: 'Select Tool'
	},
	{
		id: 'rectangle',
		icon: 'square',
		title: 'Rectangle Tool'
	},
	{
		id: 'circle',
		icon: 'circle',
		title: 'Circle Tool'
	},
	{
		id: 'text',
		icon: 'type',
		title: 'Text Tool'
	}
] as const;
