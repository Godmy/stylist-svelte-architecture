import SceneCameraControl from './index.svelte';
import type { RecipeSceneCameraControl } from '$stylist/graph/interface/recipe/scene-camera-control';
import type { ContractStory } from '$stylist/html/interface/contract/story';

/** Camera plane and zoom control; index.story.svelte feeds its changes back. */
export default {
	component: SceneCameraControl,
	title: 'SceneCameraControl',
	description: 'Camera plane and zoom control for interactive scene navigation.',
	args: {
		radius: 8.4,
		minRadius: 4,
		maxRadius: 16,
		sceneFitRadius: 10.5,
		targetX: 1.5,
		targetY: -2.2
	},
	controls: {
		radius: { type: 'range', min: 4, max: 16, step: 0.1 },
		minRadius: { type: 'number', min: 1, max: 8, step: 0.5 },
		maxRadius: { type: 'number', min: 8, max: 40, step: 0.5 },
		sceneFitRadius: { type: 'number', min: 1, max: 40, step: 0.5 },
		targetX: { type: 'range', min: -10, max: 10, step: 0.1 },
		targetY: { type: 'range', min: -10, max: 10, step: 0.1 }
	}
} satisfies ContractStory<RecipeSceneCameraControl>;
