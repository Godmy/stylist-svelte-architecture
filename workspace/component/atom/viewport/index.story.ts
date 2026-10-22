import Viewport from '$stylist/workspace/component/atom/viewport/index.svelte';
import type { RecipeViewport } from '$stylist/workspace/interface/recipe/viewport';
import type { ContractStory } from '$stylist/html/interface/contract/story';

/** Pan and zoom viewport; index.story.svelte owns the camera the viewport moves. */
export default {
	component: Viewport,
	title: 'Viewport',
	description:
		'Pan and zoom viewport over a stage. Drag, scroll or use the arrow keys, + and - to move the camera.',
	args: {
		camera: { x: 0, y: 0, zoom: 1 },
		interactive: true,
		showGrid: true,
		worldWidth: 1200,
		worldHeight: 800
	},
	controls: {
		interactive: { type: 'boolean' },
		showGrid: { type: 'boolean' },
		worldWidth: { type: 'number', min: 400, max: 4000, step: 100 },
		worldHeight: { type: 'number', min: 300, max: 4000, step: 100 }
	},
	presets: {
		Zoomed: { camera: { x: 80, y: 40, zoom: 1.6 } },
		Overview: { camera: { x: 0, y: 0, zoom: 0.5 } },
		Static: { interactive: false, showGrid: false }
	}
} satisfies ContractStory<RecipeViewport>;
