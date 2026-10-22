import TurtleDissolveScene from '$stylist/webgl/component/molecule/turtle-dissolve-scene/index.svelte';
import type { RecipeTurtleDissolveScene } from '$stylist/webgl/interface/recipe/turtle-dissolve-scene';
import type { ContractStory } from '$stylist/html/interface/contract/story';

/** Caustic dissolve field; index.story.svelte gives the absolutely positioned scene a sized frame. */
export default {
	component: TurtleDissolveScene,
	title: 'TurtleDissolveScene',
	description:
		"Procedural teal/white caustic dissolve field, intensity peaking mid-progress. The turtle-hero-morph organism's WebGL accent during the photo→mark morph window.",
	args: { progress: 0.6 },
	controls: {
		progress: { type: 'range', min: 0, max: 1, step: 0.01 }
	},
	presets: { Start: { progress: 0 }, Peak: { progress: 0.5 }, End: { progress: 1 } }
} satisfies ContractStory<RecipeTurtleDissolveScene>;
