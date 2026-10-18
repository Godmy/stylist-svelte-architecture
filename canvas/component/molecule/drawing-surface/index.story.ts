import DrawingSurface from './index.svelte';
import type { RecipeDrawingSurface } from '$stylist/canvas/interface/recipe/drawing-surface';
import type { ContractStory } from '$stylist/html/interface/contract/story';

/** Canvas-based sketch layer. */
export default {
	component: DrawingSurface,
	title: 'DrawingSurface',
	description: 'Canvas-based sketch layer with tool, stroke and surface settings.',
	args: {
		width: 640,
		height: 360,
		drawingEnabled: true,
		tool: 'pen',
		strokeWidth: 2,
		strokeColor: '#111827',
		backgroundColor: '#ffffff'
	},
	controls: {
		width: { type: 'number', min: 300, max: 1000, step: 20 },
		height: { type: 'number', min: 200, max: 700, step: 20 },
		drawingEnabled: { type: 'boolean' },
		tool: { type: 'select', options: ['pen', 'eraser', 'select'] },
		strokeWidth: { type: 'number', min: 1, max: 24, step: 1 },
		strokeColor: { type: 'color' },
		backgroundColor: { type: 'color' }
	},
	presets: { Eraser: { tool: 'eraser', strokeWidth: 16 }, 'Read only': { drawingEnabled: false } }
} satisfies ContractStory<RecipeDrawingSurface>;
