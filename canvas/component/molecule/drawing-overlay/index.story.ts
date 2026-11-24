import DrawingOverlay from '$stylist/canvas/component/molecule/drawing-overlay/index.svelte';
import type { RecipeDrawingOverlay } from '$stylist/canvas/interface/recipe/drawing-overlay';
import type { ContractStory } from '$stylist/html/interface/contract/story';

/** Freehand annotation layer over previews or captured regions. */
export default {
	component: DrawingOverlay,
	title: 'Drawing Overlay',
	description:
		'Canvas-domain annotation layer for freehand drawing over previews or captured regions.',
	args: { drawColor: '#ff0000', strokeWidth: 3, offsetTop: 0 },
	controls: {
		drawColor: { type: 'color' },
		strokeWidth: { type: 'number', min: 1, max: 24, step: 1 },
		offsetTop: { type: 'number', min: 0, max: 120, step: 8 }
	},
	layout: 'fullscreen'
} satisfies ContractStory<RecipeDrawingOverlay>;
