import CanvasToolbar from '$stylist/canvas/component/molecule/canvas-toolbar/index.svelte';
import type { RecipeCanvasToolbar } from '$stylist/canvas/interface/recipe/canvas-toolbar';
import type { ContractStory } from '$stylist/html/interface/contract/story';
import { CANVAS_TOOLBAR_DRAWING_TOOL } from '$stylist/canvas/const/array/canvas-toolbar-drawing-tool';

/** Tool selector for sketch surfaces. */
export default {
	component: CanvasToolbar,
	title: 'CanvasToolbar',
	description:
		'Tool selector for sketch surfaces: pen/eraser switch, line width and stroke color options, clear, undo, redo and save actions.',
	args: {
		selectedTool: 'pen',
		drawingOptions: { lineWidth: 2, strokeColor: '#2563eb', tool: 'pen', mode: 'draw' }
	},
	controls: {
		selectedTool: { type: 'select', options: CANVAS_TOOLBAR_DRAWING_TOOL }
	},
	presets: {
		Eraser: {
			selectedTool: 'eraser',
			drawingOptions: { lineWidth: 12, strokeColor: '#2563eb', tool: 'eraser', mode: 'erase' }
		}
	}
} satisfies ContractStory<RecipeCanvasToolbar>;
