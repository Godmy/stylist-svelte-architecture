/**
 * Shapes a shared canvas can place, in palette order. `rounded` is a rectangle
 * with rounded corners; `polygon` is a recognized freehand figure whose
 * corners are stored on the object (`vertices`), so it has no palette button.
 */
export const CANVAS_SHAPE_KIND = [
	'rectangle',
	'rounded',
	'ellipse',
	'triangle',
	'right-triangle',
	'diamond',
	'parallelogram',
	'trapezoid',
	'pentagon',
	'hexagon',
	'octagon',
	'star',
	'cross',
	'arrow-right',
	'arrow-left',
	'chevron',
	'callout',
	'cylinder',
	'cloud',
	'heart',
	'polygon'
] as const;
