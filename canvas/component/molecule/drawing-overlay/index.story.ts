import DrawingOverlay from '$stylist/canvas/component/molecule/drawing-overlay/index.svelte';
import type { RecipeDrawingOverlay } from '$stylist/canvas/interface/recipe/drawing-overlay';
import type { ContractStory } from '$stylist/html/interface/contract/story';

/** Freehand annotation layer over previews or captured regions. */
export default {
	component: DrawingOverlay,
	title: 'Drawing Overlay',
	description:
		'Canvas-domain annotation layer for freehand drawing over previews or captured regions.',
	args: { drawColor: '#ff0000' },
	controls: { drawColor: { type: 'color' } },
	layout: 'fullscreen'
} satisfies ContractStory<RecipeDrawingOverlay>;
