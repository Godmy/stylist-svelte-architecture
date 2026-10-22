import Scene from '$stylist/graph/component/organism/scene/index.svelte';
import type { RecipeScene } from '$stylist/graph/interface/recipe/scene';
import type { ContractStory } from '$stylist/html/interface/contract/story';

/** Standalone WebGL graph with spatial nodes and connections. */
export default {
	component: Scene,
	title: 'Graph Scene',
	description: 'Standalone WebGL graph with spatial nodes and connections.',
	args: {
		title: 'WebGL Graph',
		rotateHint: 'LMB + drag to orbit the camera',
		zoomHint: 'Mouse wheel to zoom'
	},
	controls: {
		title: { type: 'text' },
		rotateHint: { type: 'text' },
		zoomHint: { type: 'text' }
	}
} satisfies ContractStory<RecipeScene>;
