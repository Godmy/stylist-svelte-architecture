import SceneLauncher from '$stylist/webgl/component/organism/scene-launcher/index.svelte';
import type { RecipeSceneLauncher } from '$stylist/webgl/interface/recipe/scene-launcher';
import type { ContractStory } from '$stylist/html/interface/contract/story';

/** Fullscreen launcher for WebGL shader scenes. */
export default {
	component: SceneLauncher,
	title: 'SceneLauncher',
	description: 'Fullscreen launcher for WebGL shader scenes.',
	args: { ringCount: 100 },
	controls: {
		ringCount: { type: 'range', min: 8, max: 180, step: 1 }
	},
	layout: 'centered'
} satisfies ContractStory<RecipeSceneLauncher>;
