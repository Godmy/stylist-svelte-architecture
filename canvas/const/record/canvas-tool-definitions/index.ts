/**
 * Tools of SharedCanvas in toolbar order: `key` is the keyboard shortcut,
 * `title` the English fallback (the component shows catalog names by id).
 */
export const SHARED_CANVAS_TOOL_DEFINITIONS = [
	{ id: 'select', key: 'v', title: 'Select' },
	{ id: 'hand', key: 'h', title: 'Hand' },
	{ id: 'text', key: 't', title: 'Text' },
	{ id: 'sticky', key: 'n', title: 'Sticky note' },
	{ id: 'shape', key: 's', title: 'Shapes' },
	{ id: 'pen', key: 'p', title: 'Pen' },
	{ id: 'line', key: 'l', title: 'Line' },
	{ id: 'arrow', key: 'a', title: 'Arrow' },
	{ id: 'frame', key: 'f', title: 'Frame' },
	{ id: 'icon', key: 'i', title: 'Icon' },
	{ id: 'eraser', key: 'e', title: 'Eraser' }
] as const;
