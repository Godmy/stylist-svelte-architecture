import ConcentricCirclesScene from '$stylist/webgl/component/molecule/concentric-circles-scene/index.svelte';
import type { RecipeConcentricCirclesScene } from '$stylist/webgl/interface/recipe/concentric-circles-scene';
import type { ContractStory } from '$stylist/html/interface/contract/story';

/** Animated concentric circle shader scene; index.story.svelte gives it a sized frame. */
export default {
	component: ConcentricCirclesScene,
	title: 'ConcentricCirclesScene',
	description: 'Animated concentric circle shader scene.',
	args: { ringCount: 100 },
	controls: {
		ringCount: { type: 'range', min: 8, max: 180, step: 1 }
	},
	presets: { Sparse: { ringCount: 12 } }
} satisfies ContractStory<RecipeConcentricCirclesScene>;
