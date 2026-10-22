import HyperspaceScene from '$stylist/webgl/component/molecule/hyperspace-scene/index.svelte';
import type { RecipeHyperspaceScene } from '$stylist/webgl/interface/recipe/hyperspace-scene';
import type { ContractStory } from '$stylist/html/interface/contract/story';

/** Animated hyperspace shader scene; index.story.svelte gives it a sized frame. */
export default {
	component: HyperspaceScene,
	title: 'HyperspaceScene',
	description: 'Animated hyperspace shader scene.'
} satisfies ContractStory<RecipeHyperspaceScene>;
